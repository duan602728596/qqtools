import * as https from 'node:https';
import * as http from 'node:http';
import type { IncomingMessage, ServerResponse, ClientRequest } from 'node:http';
import { workerData } from 'node:worker_threads';
import type * as Playwright from 'playwright-core';
import type { BrowserType, Browser, BrowserContext, Page, JSHandle, Route, Cookie } from 'playwright-core';
import type { UserScriptRendedData } from '@qqtools3/qqtools/src/QQ/qq.types';
import asarNodeRequire from '../asarNodeRequire';

const playwright: typeof Playwright = asarNodeRequire('playwright-core');

const maxAge: number = 7 * 24 * 60 * 60;

/* 根据路径获取不同的启动器 */
function getBrowser(executablePath: string): BrowserType {
  if (/Safari/i.test(executablePath)) {
    return playwright.webkit;
  } else if (/(Firefox|火狐)/i.test(executablePath)) {
    return playwright.firefox;
  } else {
    return playwright.chromium;
  }
}

const baseUrl: string = `http://localhost:${ workerData.port }`;

function response404NotFound(httpResponse: ServerResponse): void {
  httpResponse.statusCode = 404;
  httpResponse.end('404 not found.');
}

/* 微博图片处理 */
/**
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

/**
 * @param { URL } urlParse
 * @param { IncomingMessage } httpRequest
 * @param { ServerResponse } httpResponse
 */
async function douyinResponseHandle(
  urlParse: URL,
  httpRequest: IncomingMessage,
  httpResponse: ServerResponse
): Promise<void> {
  const body: { e: string | null; u: string | null; c: string } = JSON.parse(await getPostBody(httpRequest));
  const executablePath: string | null = body.e;
  const userId: string | null = body.u;

  if (!(executablePath && !/^\s*$/.test(executablePath) && userId && !/^\s*$/.test(userId))) {
    httpResponse.statusCode = 400;
    httpResponse.end(JSON.stringify({ error: '参数缺失' }));

    return;
  }

  let browser: Browser | null = null;

  try {
    browser = await getBrowser(executablePath).launch({
      headless: true,
      executablePath: decodeURIComponent(executablePath),
      timeout: 180_000
    });
    const context: BrowserContext = await browser.newContext({
      ignoreHTTPSErrors: true,
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) '
        + 'Chrome/109.0.0.0 Safari/537.36 Edg/109.0.1518.52',
      serviceWorkers: 'block',
      extraHTTPHeaders: { Cookie: body.c }
    });

    await context.route(
      (url: URL): boolean => !(/^\/user\//i.test(url.pathname) && /douyin\.com/i.test(url.hostname)),
      (route: Route): Promise<void> => route.abort());

    const page: Page = await context.newPage();
    const userUrl: string = `https://www.douyin.com/user/${ userId }`;

    await page.goto(userUrl, { referer: userUrl });
    await page.locator('#RENDER_DATA');

    const renderDataHandle: JSHandle<string | null> = await page.evaluateHandle((): string | null => {
      const scriptElement: HTMLElement | null = document.getElementById('RENDER_DATA');

      return scriptElement ? scriptElement.innerHTML : null;
    });
    const renderData: string | null = await renderDataHandle.evaluate(
      (node: string | null): string | null => node ? decodeURIComponent(node) : null);
    const renderDataJson: UserScriptRendedData | undefined = renderData ? JSON.parse(renderData) : undefined;
    const cookie: Array<Cookie> = await context.cookies();

    await page.close();
    await browser.close();
    httpResponse.setHeader('Content-type', 'application/json');
    httpResponse.statusCode = 200;
    httpResponse.end(JSON.stringify({ data: renderDataJson ?? null, cookie }));
  } catch (err) {
    browser && (await browser.close());
    httpResponse.statusCode = 400;
    httpResponse.end(JSON.stringify({ error: err.toString() }));
  }

  browser = null;
}

/* 开启代理服务，加载ts文件 */
http.createServer(function(httpRequest: IncomingMessage, httpResponse: ServerResponse): void {
  if (!httpRequest.url) {
    return response404NotFound(httpResponse);
  }

  const urlParse: URL = new URL(httpRequest.url, baseUrl);

  if (urlParse.pathname === '/douyin/renderdata') {
    douyinResponseHandle(urlParse, httpRequest, httpResponse);
  } else if (urlParse.pathname === '/proxy/weibo/image') {
    weiboResponseHandle(urlParse, httpResponse);
  } else {
    response404NotFound(httpResponse);
  }
}).listen(workerData.port);