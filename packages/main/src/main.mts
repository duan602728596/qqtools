import * as process from 'node:process';
import { app } from 'electron';
import { nodeNimCleanup } from './ipcHandle/nodeNimHandleLogin.mjs';
import { createWindow, processWindow } from './ProcessWindow.mjs';

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = '1'; // 关闭警告

app.whenReady().then(createWindow);

app.on('window-all-closed', function(): void {
  nodeNimCleanup();

  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function(): void {
  if (processWindow === null) {
    createWindow();
  }
});