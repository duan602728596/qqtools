import * as https from 'node:https';
import * as http from 'node:http';
import type { IncomingMessage, ServerResponse, ClientRequest } from 'node:http';
import { workerData } from 'node:worker_threads';
import type Got from 'got';
import type { Response as GotResponse } from 'got';
import type { AwemePostResponse } from '@qqtools3/qqtools/src/QQ/services/interface';
import asarNodeDevRequire from '../asarNodeRequire';

const got: typeof Got = asarNodeDevRequire('got');

const maxAge: number = 7 * 24 * 60 * 60;
const baseUrl: string = `http://localhost:${ workerData.port }`;

/* 桶 */
class Bucket {
  public readonly max: number;
  public count: number;
  private readonly interval: number;
  private readonly timer: NodeJS.Timeout;
  private callback?: Function;

  constructor(max: number, interval: number, cb?: Function) {
    this.max = max;
    this.count = max;
    this.interval = interval;
    this.callback = cb;
    this.timer = setInterval((): void => {
      if (this.count < this.max) {
        this.count++;
      }

      this.count > 0 && cb?.();
    }, this.interval);
  }

  public destroy(): void {
    clearInterval(this.timer);
  }
}

/* 队列 */
interface QueueConfig {
  workerLen?: number;
  verifyFunction?: () => boolean;
}

interface TaskFunc {
  (...args: any[]): any;
}

type Task = [taskFunc: TaskFunc, self?: any, ...args: any[]];

class Queue {
  public workerLen: number;         // Number of tasks executed simultaneously 同时执行的任务数量
  public waitingTasks: Array<Task>; // Queue of tasks waiting to be executed   等待执行的任务队列
  public workerTasks: Array<Generator | undefined>; // Task in progress 正在执行的任务
  public verifyFunction?: () => boolean;

  constructor(config?: QueueConfig) {
    this.workerLen = config?.workerLen ?? 3;
    this.waitingTasks = [];
    this.workerTasks = new Array<Generator | undefined>(this.workerLen);
    this.verifyFunction = config?.verifyFunction;
  }

  /**
   * Add to the queue of tasks waiting to be executed
   * 添加到等待执行的任务队列
   * @param { Array<Task> } tasks
   */
  use(...tasks: Array<Task>): void {
    for (const task of tasks) {
      this.waitingTasks.unshift(task);
    }
  }

  /**
   * Perform a task
   * 执行一个任务
   * @param { number } index
   * @param { Task } task
   */
  *executionTask(index: number, task: Task): Generator {
    const [taskFunc, self, ...args]: Task = task;

    yield ((): any => {
      const callback: Function = (): void => {
        this.workerTasks[index] = undefined;

        if (!this.verifyFunction || this.verifyFunction()) {
          this.run();
        }
      };

      let callFunc: any;

      try {
        callFunc = taskFunc.call(self, ...args);
      } finally {
        // After the task is executed, assign the task again and execute the task
        // 任务执行完毕后，再次分配任务并执行任务
        if (typeof callFunc?.finally === 'function') {
          callFunc.finally(callback);
        } else {
          callback();
        }
      }
    })();
  }

  /**
   * Assign and execute tasks
   * 分配并执行任务
   */
  run(): void {
    const runIndex: Array<number> = [];

    for (let i: number = 0; i < this.workerLen; i++) {
      const len: number = this.waitingTasks.length;

      if (!this.workerTasks[i] && len > 0) {
        this.workerTasks[i] = this.executionTask(i, this.waitingTasks[len - 1]);
        runIndex.push(i);
        this.waitingTasks.pop(); // Delete tasks from the task queue 从任务队列内删除任务
      }
    }

    for (const index of runIndex) {
      this.workerTasks[index]?.next?.();
    }
  }
}

function response404NotFound(httpResponse: ServerResponse): void {
  httpResponse.statusCode = 404;
  httpResponse.end('404 not found.');
}

/**
 * 微博图片处理
 * @param { URL } urlParse
 * @param { ServerResponse } httpResponse
 */
function weiboResponseHandle(urlParse: URL, httpResponse: ServerResponse): void {
  const imageUrl: string | null = urlParse.searchParams.get('url');

  if (!imageUrl) return response404NotFound(httpResponse);

  const deImageUrl: string = decodeURIComponent(imageUrl);
  const deImageUrlParse: URL = new URL(deImageUrl);

  const req: ClientRequest = (deImageUrlParse.protocol === 'https:' ? https : http)
    .get(deImageUrl, { headers: { Referer: 'https://www.weibo.com/' } }, function(response: IncomingMessage): void {
      const buffer: Array<Buffer> = [];

      response.on('data', (chunk: Buffer): unknown => buffer.push(chunk));

      response.on('end', (): void => {
        httpResponse.setHeader('Content-type', response.headers['content-type'] ?? 'image/png');
        httpResponse.setHeader('Cache-Control', `max-age=${ maxAge }`);
        httpResponse.end(Buffer.concat(buffer));
      });

      response.on('error', (error: Error): void => {
        httpResponse.statusCode = response.statusCode ?? 400;
        httpResponse.end(null);
        console.error(`[Http response error] ${ deImageUrl }\n`, error, '\n');
      });
    });

  req.on('error', function(error: Error): void {
    httpResponse.statusCode = 400;
    httpResponse.end(null);
    console.error(`[Http request error] ${ deImageUrl }\n`, error, '\n');
  });
}

/* 获取POST body */
function getPostBody(httpRequest: IncomingMessage): Promise<string> {
  return new Promise((resolve: Function, reject: Function): void => {
    const body: Array<Buffer> = [];

    httpRequest.on('data', (chunk: Buffer): void => {
      body.push(chunk);
    });

    httpRequest.on('end', (): void => {
      resolve(Buffer.concat(body).toString());
    });
  });
}

/* 抖音接口处理 */
const pcUserAgent: string = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  + '(KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36 Edg/110.0.1587.69';
// eslint-disable-next-line @typescript-eslint/no-use-before-define
const bucket: Bucket = new Bucket(5, 3 * 60 * 1_000, (): void => queue.run());
const queue: Queue = new Queue({
  workerLen: 1,
  verifyFunction: (): boolean => bucket.count > 0
});

interface PostJson {
  cookieString?: string;
  query?: string;
  userId: string;
}

/**
 * 请求user的视频列表
 * @param { string } cookie: string
 * @param { string } userId: user id
 * @param { string } query: 查询
 */
export async function requestAwemePost(cookie: string, userId: string, query: string): Promise<AwemePostResponse | string> {
  const res: GotResponse<AwemePostResponse | string> = await got.get(`https://www.douyin.com/aweme/v1/web/aweme/post/?${ query }`, {
    responseType: 'json',
    headers: {
      Referer: `https://www.douyin.com/user/${ userId }`,
      Host: 'www.douyin.com',
      'User-Agent': pcUserAgent,
      Cookie: cookie
    },
    timeout: 180_000,
    followRedirect: false
  });

  return res.body;
}

async function douyinResponse(httpResponse: ServerResponse, json: PostJson): Promise<void> {
  if (!(json.cookieString && json.query && json.userId)) {
    httpResponse.statusCode = 400;
    httpResponse.end('');

    return;
  }

  if (bucket.count > 0) bucket.count--;

  try {
    const res: AwemePostResponse | string = await requestAwemePost(json.cookieString, json.userId, json.query);

    if (res && typeof res === 'object') {
      httpResponse.statusCode = 200;
      httpResponse.end(JSON.stringify({ data: res }));
    } else {
      httpResponse.statusCode = 200;
      httpResponse.end(JSON.stringify({ data: null }));
    }
  } catch (err) {
    console.error(err);
    httpResponse.statusCode = 400;
    httpResponse.end(err);
  }
}

async function douyinUserResponseHandle(httpRequest: IncomingMessage, httpResponse: ServerResponse): Promise<void> {
  const body: string = await getPostBody(httpRequest);
  const json: PostJson = JSON.parse(body);

  queue.use([douyinResponse, undefined, httpResponse, json]);

  if (bucket.count > 0) queue.run();
}

/* 开启代理服务 */
http.createServer(function(httpRequest: IncomingMessage, httpResponse: ServerResponse): void {
  if (!httpRequest.url) {
    return response404NotFound(httpResponse);
  }

  const urlParse: URL = new URL(httpRequest.url, baseUrl);

  if (urlParse.pathname === '/proxy/weibo/image') {
    weiboResponseHandle(urlParse, httpResponse);
  } else if (urlParse.pathname === '/proxy/douyin/user') {
    douyinUserResponseHandle(httpRequest, httpResponse);
  } else {
    response404NotFound(httpResponse);
  }
}).listen(workerData.port);