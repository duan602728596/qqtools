import { ipcMain, type BrowserWindow } from 'electron';
import openDevTools, { type as openDevToolsType } from './ipcListener/openDevTools';
import { proxyServerInit, type as proxyServerType } from './proxyServer/proxyServer';

/* 移除所有监听的通信 */
const removeListenerChannel: Array<string> = [
  openDevToolsType,
  proxyServerType
];

export function removeIpc(): void {
  for (const channel of removeListenerChannel) {
    ipcMain.removeAllListeners(channel);
  }
}

/* ipc通信 */
export function ipc(win: BrowserWindow): void {
  openDevTools(win);
  proxyServerInit();
}