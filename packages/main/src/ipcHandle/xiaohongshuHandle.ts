import * as path from 'node:path';
import * as process from 'node:process';
import { setTimeout } from 'node:timers';
import * as fsP from 'node:fs/promises';
import { ipcMain, BrowserWindow, type IpcMainInvokeEvent, type Cookie } from 'electron';
import { pcUserAgent, isDevelopment } from '../utils';

let xiaohongshuWin: BrowserWindow | null;

function ipcXiaohongshuHandle(): void {
  // 初始化小红书窗口并注入脚本
  ipcMain.handle(
    'xiaohongshu-window-init',
    function(event: IpcMainInvokeEvent): Promise<void> {
      return new Promise((resolve: Function, reject: Function): void => {
        xiaohongshuWin = new BrowserWindow({
          width: 1000,
          height: 800,
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
  ipcMain.handle(
    'xiaohongshu-cookie',
    async function(event: IpcMainInvokeEvent, port: number): Promise<string> {
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
  ipcMain.handle(
    'xiaohongshu-destroy',
    function(): void {
      xiaohongshuWin?.close?.();
      xiaohongshuWin = null;
    });
}

export default ipcXiaohongshuHandle;