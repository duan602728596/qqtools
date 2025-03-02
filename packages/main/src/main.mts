import { env, platform } from 'node:process';
import { app } from 'electron';
import { nodeNimCleanup } from './ipcHandle/nodeNimHandleLogin.mjs';
import { createWindow, processWindow } from './ProcessWindow.mjs';

env.ELECTRON_DISABLE_SECURITY_WARNINGS = '1'; // 关闭警告

app.whenReady().then(createWindow);

app.on('window-all-closed', function(): void {
  nodeNimCleanup();

  if (platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function(): void {
  if (processWindow === null) {
    createWindow();
  }
});