import broadcastName from './broadcastName';

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

// eslint-disable-next-line @typescript-eslint/no-use-before-define
const bucket: Bucket = new Bucket(20, .4 * 60 * 1_000, (): void => queue.run());
const queue: Queue = new Queue({ workerLen: 1, verifyFunction: (): boolean => bucket.count > 0 });
const broadcastChannel: BroadcastChannel = new BroadcastChannel(broadcastName);

/* 发送消息 */
function sendMessage(id: string): void {
  if (bucket.count > 0) bucket.count--;

  broadcastChannel.postMessage({ t: new Date().getTime(), id });
}

/* 监听消息 */
function handleBroadcastChannelMessage(event: MessageEvent<{ id: string }>): void {
  queue.use([sendMessage, undefined, event.data.id]);

  if (bucket.count > 0) queue.run();
}

broadcastChannel.addEventListener('message', handleBroadcastChannelMessage);

/* 初始化连接 */
addEventListener('connect', function(messageEvent: MessageEvent): void {
  const port: MessagePort = messageEvent.ports[0];

  port.start();
  port.postMessage('连接成功！');
});