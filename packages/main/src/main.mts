import * as process from 'node:process';
import { app, BrowserWindow, Menu } from 'electron';
import { isDevelopment, titleBarIcon, createHtmlFilePath, packageJson } from './utils.mjs';
import { ipc, removeIpc } from './ipc.mjs';
import ipcRemoteHandle from './ipcHandle/ipcRemoteHandle.mjs';
import xiaohongshuHandle, { closeAll as xiaohongshuCloseAll } from './ipcHandle/xiaohongshuHandle.mjs';
import { proxyServerClose } from './proxyServer/proxyServer.mjs';
import logProtocol from './logProtocol/logProtocol.mjs';

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = '1'; // 关闭警告

/* BrowserWindow窗口对象 */
let processWindow: BrowserWindow | null = null;

/* 初始化 */
function createWindow(): void {
  logProtocol();

  processWindow = new BrowserWindow({
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
    processWindow.webContents.openDevTools();
  }

  processWindow.loadFile(createHtmlFilePath('index'));

  // 去掉顶层菜单
  Menu.setApplicationMenu(null);

  ipc(processWindow);

  try {
    ipcRemoteHandle();
    xiaohongshuHandle();
  } catch {}

  processWindow.on('closed', async function(): Promise<void> {
    await proxyServerClose();
    xiaohongshuCloseAll();
    removeIpc();
    processWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', function(): void {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function(): void {
  if (processWindow === null) {
    createWindow();
  }
});