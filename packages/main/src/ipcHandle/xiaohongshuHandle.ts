import * as path from 'node:path';
import * as process from 'node:process';
import { setTimeout } from 'node:timers';
import { setTimeout as setTimeoutPromise } from 'node:timers/promises';
import * as fsP from 'node:fs/promises';
import { ipcMain, BrowserWindow, type IpcMainInvokeEvent, type Cookie } from 'electron';
import * as CDP from 'chrome-remote-interface';
import type { Client } from 'chrome-remote-interface';
import type { Protocol } from 'devtools-protocol/types/protocol';
import * as ChromeLauncher from 'chrome-launcher';
import type { LaunchedChrome } from 'chrome-launcher';
import { pcUserAgent, isDevelopment } from '../utils';

let xiaohongshuWin: BrowserWindow | null = null,
  client: Client | null = null,
  chromeLauncher: LaunchedChrome | null = null;

async function chromeStart(executablePath: string, port: number): Promise<void> {
  chromeLauncher = await ChromeLauncher.launch({
    chromePath: executablePath,
    port,
    chromeFlags: ['--disable-gpu', '--window-size=400,400']
  });
}

export function closeAll(): void {
  xiaohongshuWin?.close?.();
  xiaohongshuWin = null;
  chromeLauncher?.kill();
  chromeLauncher = null;
  client?.close();
  client = null;
}

export async function clientSwitch(): Promise<void> {
  if (client) {
    const { targetInfos }: Protocol.Target.GetTargetsResponse = await client.Target.getTargets();
    const xiaohongshuTarget: Protocol.Target.TargetInfo | undefined = targetInfos.find(
      (target: Protocol.Target.TargetInfo): boolean => target.type === 'page' && target.url.includes('www.xiaohongshu.com'));

    if (xiaohongshuTarget && !xiaohongshuTarget.attached) {
      await client.Target.attachToTarget({ targetId: xiaohongshuTarget.targetId });
    }
  }
}

function ipcXiaohongshuHandle(): void {
  // 初始化小红书窗口并注入脚本
  ipcMain.handle('xiaohongshu-window-init', function(event: IpcMainInvokeEvent): Promise<void> {
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
  ipcMain.handle('xiaohongshu-cookie', async function(event: IpcMainInvokeEvent, port: number): Promise<string> {
    if (xiaohongshuWin) {
      const script: string = await fsP.readFile(
        isDevelopment
          ? path.join(__dirname, '../preload/xiaohongshuServerInject.js')
          : path.join(process.resourcesPath, 'app.asar.unpacked/bin/lib/preload/xiaohongshuServerInject.js'),
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
  ipcMain.handle('xiaohongshu-destroy', function(event: IpcMainInvokeEvent): void {
    closeAll();
  });

  // 小红书协议连接
  ipcMain.handle(
    'xiaohongshu-chrome-remote-init',
    async function(event: IpcMainInvokeEvent, executablePath: string, port: number): Promise<void> {
      await chromeStart(executablePath, port);
      client = await CDP({ port });
      await Promise.all([
        client.Page.enable(),
        client.Network.enable(),
        client.Runtime.enable()
      ]);
      await client.Page.navigate({ url: 'https://www.xiaohongshu.com/user/profile/594099df82ec393174227f18' });
      await client.Page.loadEventFired();

      let waitingDom: boolean = true;

      // 等待dom出现
      while (waitingDom) {
        const result: Protocol.Runtime.EvaluateResponse = await client.Runtime.evaluate({ expression: `
          !!(document.querySelector('.user-nickname')
             || document.querySelector('.reds-button-new')
             || document.querySelector('.follow')
          )` });

        if (result.result.value) {
          waitingDom = false;
        } else {
          await setTimeoutPromise(1_000);
        }
      }

      await setTimeoutPromise(7_000);
    });

  // 获取cookie
  ipcMain.handle(
    'xiaohongshu-chrome-remote-cookie',
    async function(event: IpcMainInvokeEvent, executablePath: string, port: number): Promise<string> {
      await clientSwitch();

      if (client) {
        const cookies: string = (await client.Network.getCookies()).cookies
          .map((cookie: Protocol.Network.Cookie): string => `${ cookie.name }=${ cookie.value }`).join('; ');

        return cookies;
      }

      return '';
    });

  // 获取header的加密
  ipcMain.handle(
    'xiaohongshu-chrome-remote-sign',
    async function(event: IpcMainInvokeEvent, url: string, data: string | undefined): Promise<string | undefined> {
      await clientSwitch();

      if (client) {
        const signResult: Protocol.Runtime.EvaluateResponse = await client.Runtime.evaluate({
          expression: `JSON.stringify(window._webmsxyw("${ url }", ${ data ?? 'undefined' }));`
        });

        return signResult.result.value;
      }

      return undefined;
    });
}

export default ipcXiaohongshuHandle;