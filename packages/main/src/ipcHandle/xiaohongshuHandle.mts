import * as path from 'node:path';
import { setTimeout } from 'node:timers';
import * as fsP from 'node:fs/promises';
import * as process from 'node:process';
import { ipcMain, BrowserWindow, type IpcMainInvokeEvent, type Cookie } from 'electron';
// @ts-ignore
import CDP from 'chrome-remote-interface';
import type { Client } from 'chrome-remote-interface';
import type { Protocol } from 'devtools-protocol/types/protocol.js';
import type { LaunchedChrome } from 'chrome-launcher';
import { pcUserAgent, isDevelopment, workerProductionBasePath, metaHelper, type MetaHelperResult } from '../utils.mjs';
import { chromeStart, clientSwitch, waitingDomFunction } from './CDPHelper.mjs';
import { XiaohongshuHandleChannel } from '../channelEnum.js';

const { __dirname }: MetaHelperResult = metaHelper(import.meta.url);
let xiaohongshuWin: BrowserWindow | null = null,
  client: Client | null = null,
  chromeLauncher: LaunchedChrome | null = null;

type XiaoHongShuSignUsePlatform = 'Mac OS' | 'Window' | 'Linux';

const platform: XiaoHongShuSignUsePlatform = (function(): XiaoHongShuSignUsePlatform {
  if (/mac|darwin/i.test(process.platform)) {
    return 'Mac OS';
  } else if (/win/i.test(process.platform)) {
    return 'Window';
  } else {
    return 'Linux';
  }
})();

export function closeAll(): void {
  xiaohongshuWin?.close?.();
  xiaohongshuWin = null;
  chromeLauncher?.kill();
  chromeLauncher = null;
  client?.close();
  client = null;
}

function ipcXiaohongshuHandle(): void {
  // 初始化小红书窗口并注入脚本
  ipcMain.handle(XiaohongshuHandleChannel.XiaohongshuWindoInit, function(event: IpcMainInvokeEvent): Promise<void> {
    return new Promise((resolve: Function, reject: Function): void => {
      xiaohongshuWin = new BrowserWindow({
        width: 400,
        height: 400,
        webPreferences: {
          nodeIntegration: true,
          nodeIntegrationInWorker: true,
          webSecurity: false,
          contextIsolation: false
        },
        show: false
      });

      isDevelopment && xiaohongshuWin.webContents.openDevTools();

      xiaohongshuWin.on('ready-to-show', function(): void {
        setTimeout(resolve, 5_000);
      });

      xiaohongshuWin.loadURL('https://www.xiaohongshu.com/user/profile/594099df82ec393174227f18', {
        userAgent: pcUserAgent
      });
    });
  });

  // 获取窗口的cookie
  ipcMain.handle(XiaohongshuHandleChannel.XiaohongshuCookie, async function(event: IpcMainInvokeEvent, port: number): Promise<string> {
    if (xiaohongshuWin) {
      const script: string = await fsP.readFile(
        isDevelopment
          ? path.join(__dirname, '../preload/xiaohongshuServerInject.js')
          : path.join(workerProductionBasePath, 'preload/xiaohongshuServerInject.js'),
        { encoding: 'utf8' });

      await xiaohongshuWin.webContents.executeJavaScript(`(() => {
  const exports = {};
  ${ script }
  globalThis.__INIT_SIGN_SERVER__(${ port });
})();`);

      const cookies: Array<Cookie> = await xiaohongshuWin.webContents.session.cookies.get({}) ?? [];

      return cookies.map((cookie: Cookie): string => `${ cookie.name }=${ cookie.value }`).join(';');
    } else {
      return '';
    }
  });

  // 销毁窗口
  ipcMain.handle(XiaohongshuHandleChannel.XiaohongshuDestroy, function(event: IpcMainInvokeEvent): void {
    closeAll();
  });

  // 小红书协议连接
  ipcMain.handle(
    XiaohongshuHandleChannel.XiaohongshuChromeRemoteInit,
    async function(event: IpcMainInvokeEvent, executablePath: string, port: number): Promise<void> {
      chromeLauncher = await chromeStart(executablePath, port);
      client = await CDP({ port });
      await Promise.all([
        client.Page.enable(),
        client.Network.enable(),
        client.Runtime.enable()
      ]);

      // 拦截并修改响应
      // https://fe-static.xhscdn.com/formula-static/xhs-pc-web/public/js/vendor-dynamic.327e555.js
      await client.Network.setRequestInterception({
        patterns: [
          {
            urlPattern: '*.js',
            resourceType: 'Script',
            interceptionStage: 'HeadersReceived'
          }
        ]
      });

      // @ts-ignore
      client.Network.requestIntercepted(async ({ interceptionId, request }: {
        interceptionId: string;
        request: Protocol.Network.Request;
      }): Promise<void> => {
        const url: string = request.url;

        if (url.includes('fe-static.xhscdn.com') && url.includes('vendor-dynamic')) {
          const response: Protocol.Network.GetResponseBodyForInterceptionResponse
            = await client!.Network.getResponseBodyForInterception({ interceptionId });
          const scriptText: string = atob(response.body);
          const newScriptText: string = scriptText.replace(
            /function xsCommon/i, 'window._xsCommon=xsCommon;function xsCommon');

          await client!.Network.continueInterceptedRequest({
            interceptionId,
            rawResponse: btoa(newScriptText),
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Content-Type': 'application/javascript'
            }
          });
        } else {
          await client!.Network.continueInterceptedRequest({ interceptionId });
        }
      });
      await client.Page.navigate({ url: 'https://www.xiaohongshu.com/user/profile/594099df82ec393174227f18' });
      await client.Page.loadEventFired();
      await waitingDomFunction(client, `
        (!!(document.querySelector('.user-nickname')
          || document.querySelector('.reds-button-new')
          || document.querySelector('.follow')
        )) && !document.getElementById('captcha-div')
      `);
    });

  // 获取cookie
  ipcMain.handle(
    XiaohongshuHandleChannel.XiaohongshuChromeRemoteCookie,
    async function(event: IpcMainInvokeEvent, executablePath: string, port: number): Promise<string> {
      await clientSwitch(client, 'www.xiaohongshu.com');

      if (client) {
        const cookies: string = (await client.Network.getCookies()).cookies
          .map((cookie: Protocol.Network.Cookie): string => `${ cookie.name }=${ cookie.value }`).join('; ');

        return cookies;
      }

      return '';
    });

  // 获取header的加密
  ipcMain.handle(
    XiaohongshuHandleChannel.XiaohongshuChromeRemoteSign,
    async function(event: IpcMainInvokeEvent, url: string, data: string | undefined): Promise<string | undefined> {
      await clientSwitch(client, 'www.xiaohongshu.com');

      if (client) {
        const signResult: Protocol.Runtime.EvaluateResponse = await client.Runtime.evaluate({
          expression: `var headers = window._webmsxyw('${ url }', ${ data ?? 'undefined' });
  var args = {
    headers,
    url: '//edith.xiaohongshu.com${ url }'
  };
  var xsCommonHeader = window._xsCommon(${ JSON.stringify({ platform }) }, args);
  JSON.stringify(args.headers);`
        });

        return signResult.result.value;
      }

      return undefined;
    });

  ipcMain.handle(
    XiaohongshuHandleChannel.XiaohongshuChromeRemoteRequestHtml,
    async function(event: IpcMainInvokeEvent, url: string): Promise<string | undefined> {
      await clientSwitch(client, 'www.xiaohongshu.com');

      if (client) {
        const signResult: Protocol.Runtime.EvaluateResponse = await client.Runtime.evaluate({
          expression: `async function requestHtml() {
            var request = await fetch('${ url }', { credentials: 'include' });
            return request.text();
          }
          requestHtml();`,
          awaitPromise: true
        });

        return signResult.result.value;
      }

      return undefined;
    }
  );
}

export default ipcXiaohongshuHandle;