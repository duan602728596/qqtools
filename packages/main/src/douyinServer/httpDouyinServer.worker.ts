import * as http from 'node:http';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { workerData } from 'node:worker_threads';
import 'asar-node';
import type * as Playwright from 'playwright-core';
import type { BrowserType, Browser, BrowserContext, Page, JSHandle, Route } from 'playwright-core';
import type { UserScriptRendedData } from '@qqtools3/qqtools/src/QQ/qq.types';
import workerRequire from '../workerRequire';

const playwright: typeof Playwright = workerRequire('playwright-core');

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

/**
 * @param { URL } urlParse
 * @param { ServerResponse } httpResponse
 */
async function douyinResponseHandle(urlParse: URL, httpResponse: ServerResponse): Promise<void> {
  const executablePath: string | null = urlParse.searchParams.get('e');
  const userId: string | null = urlParse.searchParams.get('u');

  if (!(executablePath && !/^\s*$/.test(executablePath) && userId && !/^\s*$/.test(userId))) return;

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
      serviceWorkers: 'block'
    });

    await context.route(
      (url: URL): boolean => !(/^\/user\//i.test(url.pathname) && /douyin\.com/i.test(url.hostname)),
      (route: Route) => route.abort());

    const page: Page = await context.newPage();

    await page.goto(`https://www.douyin.com/user/${ userId }`);
    await page.locator('#RENDER_DATA');

    const renderDataHandle: JSHandle<string | null> = await page.evaluateHandle((): string | null => {
      const scriptElement: HTMLElement | null = document.getElementById('RENDER_DATA');

      return scriptElement ? scriptElement.innerHTML : null;
    });
    const renderData: string | null = await renderDataHandle.evaluate(
      (node: string | null): string | null => node ? decodeURIComponent(node) : null);
    const renderDataJson: UserScriptRendedData | undefined = renderData ? JSON.parse(renderData) : undefined;

    await page.close();
    await browser.close();
    browser = null;
    httpResponse.setHeader('Content-type', 'application/json');
    httpResponse.statusCode = 200;
    httpResponse.end(JSON.stringify({ data: renderDataJson ?? null }));
  } catch (err) {
    browser && (await browser.close());
    httpResponse.statusCode = 400;
    httpResponse.end(JSON.stringify({ error: err.toString() }));
  }
}

/* 开启代理服务，加载ts文件 */
http.createServer(function(httpRequest: IncomingMessage, httpResponse: ServerResponse): void {
  if (!httpRequest.url) return;

  const urlParse: URL = new URL(httpRequest.url, baseUrl);

  if (urlParse.pathname === '/douyin/renderdata' ) {
    douyinResponseHandle(urlParse, httpResponse);
  }
}).listen(workerData.port);