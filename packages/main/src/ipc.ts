import { ipcMain, BrowserWindow, type IpcMainEvent } from 'electron';

const DEVELOP_TOOLS_CHANNEL: string = 'developer-tools';

/* 移除所有监听的通信 */
const removeListenerChannel: Array<string> = [
  DEVELOP_TOOLS_CHANNEL
];

export function removeIpc(): void {
  for (const channel of removeListenerChannel) {
    ipcMain.removeAllListeners(channel);
  }
}

/* ipc通信 */
export function ipc(win: BrowserWindow): void {
  ipcMain.on(DEVELOP_TOOLS_CHANNEL, function(event: IpcMainEvent, ...args: any[]): void {
    win.webContents.openDevTools();
  });
}