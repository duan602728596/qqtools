import * as process from 'process';
import * as path from 'path';
import * as url from 'url';
import { app, BrowserWindow, Menu } from 'electron';

const isDevelopment: boolean = process.env.NODE_ENV === 'development';
let win: BrowserWindow | null = null;

/* 初始化 */
function createWindow(): void {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false
    },
    icon: isDevelopment ? undefined : path.join(__dirname, '../../titleBarIcon.png')
  });

  if (isDevelopment) {
    win.webContents.openDevTools();
  }

  win.loadURL(isDevelopment ? 'http://127.0.0.1:5050' : url.format({
    pathname: path.join(__dirname, '../../dist/index.html'),
    protocol: 'file:',
    slashes: true
  }));

  // 去掉顶层菜单
  Menu.setApplicationMenu(null);

  win.on('closed', function(): void {
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