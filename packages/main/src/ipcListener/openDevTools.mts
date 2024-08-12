import { ipcMain, type IpcMainEvent } from 'electron';
import { WinIpcChannel } from '../channelEnum.js';
import { processWindow } from '../ProcessWindow.mjs';

/* 打开开发者工具 */
function openDevTools(): void {
  ipcMain.on(WinIpcChannel.DeveloperTools, function(event: IpcMainEvent): void {
    processWindow?.webContents.openDevTools();
  });
}

export default openDevTools;