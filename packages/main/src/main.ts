import * as process from 'node:process';
import * as path from 'node:path';
import { app, BrowserWindow, Menu } from 'electron';
import { isDevelopment, titleBarIcon, createHtmlFilePath, packageJson } from './utils';
import { ipc, removeIpc } from './ipc';
import ipcRemoteHandle from './ipcHandle/ipcRemoteHandle';
import xiaohongshuHandle, { closeAll as xiaohongshuCloseAll } from './ipcHandle/xiaohongshuHandle';
import { proxyServerClose } from './proxyServer/proxyServer';
import logProtocol from './logProtocol/logProtocol';

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = '1'; // 关闭警告

/* BrowserWindow窗口对象 */
let win: BrowserWindow | null = null;

/* 初始化 */
function createWindow(): void {
  logProtocol();

  win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      webSecurity: false,
      contextIsolation: false
    },
    title: `qqtools - ${ packageJson.version }`,
    icon: titleBarIcon
  });

  if (isDevelopment) {
    win.webContents.openDevTools();
  }

  win.loadFile(createHtmlFilePath('index'));

  // 去掉顶层菜单
  Menu.setApplicationMenu(null);

  ipc(win);

  try {
    ipcRemoteHandle();
    xiaohongshuHandle();
  } catch {}

  win.on('closed', async function(): Promise<void> {
    await proxyServerClose();
    xiaohongshuCloseAll();
    removeIpc();
    win = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', function(): void {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function(): void {
  if (win === null) {
    createWindow();
  }
});