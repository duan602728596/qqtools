import * as process from 'node:process';
import * as path from 'node:path';
import { app, BrowserWindow, Menu } from 'electron';
import * as remoteMain from '@electron/remote/main';
import { isDevelopment, packageJson } from './utils';
import { ipc, removeIpc } from './ipc';

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = '1'; // 关闭警告
remoteMain.initialize();

/* BrowserWindow窗口对象 */
let win: BrowserWindow | null = null;

/* 初始化 */
function createWindow(): void {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      webSecurity: false,
      contextIsolation: false
    },
    title: `qqtools - ${ packageJson.version }`,
    icon: isDevelopment ? undefined : path.join(__dirname, '../../titleBarIcon.png')
  });

  remoteMain.enable(win.webContents);

  if (isDevelopment) {
    win.webContents.openDevTools();
  }

  win.loadFile(
    isDevelopment
      ? path.join(__dirname, '../../qqtools/dist/index.html')
      : path.join(__dirname, '../../dist/index.html')
  );

  // 去掉顶层菜单
  Menu.setApplicationMenu(null);

  ipc(win);

  win.on('closed', function(): void {
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