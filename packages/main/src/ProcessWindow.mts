/* @#START_DEV_1 */ import './_sourcemap.mjs'; /* @#END_DEV_1 */
import { BrowserWindow, Menu } from 'electron';
import { createHtmlFilePath, isDevelopment, packageJson, titleBarIcon } from './utils.mjs';
import { ipc, removeIpc } from './ipc.mjs';
import logProtocol from './logProtocol/logProtocol.mjs';
import { proxyServerClose } from './proxyServer/proxyServer.mjs';
import xiaohongshuHandle, { closeAll as xiaohongshuCloseAll } from './ipcHandle/xiaohongshuHandle.mjs';
import { nodeNimHandleLogin, nodeNimCleanup } from './ipcHandle/nodeNimHandleLogin.mjs';
import ipcRemoteHandle from './ipcHandle/ipcRemoteHandle.mjs';
import webRequest from './webRequest/webRequest.mjs';

export let processWindow: BrowserWindow | null = null;

/* 窗口关闭事件 */
async function handleProcessWindowClosed(): Promise<void> {
  await proxyServerClose();
  xiaohongshuCloseAll();
  nodeNimCleanup();
  removeIpc();
  processWindow = null;
}

/* 初始化窗口 */
export function createWindow(): void {
  /* 初始化日志 */
  logProtocol();

  /* 初始化窗口 */
  processWindow = new BrowserWindow({
    width: 1_000,
    height: 800,
    minWidth: 1_000,
    minHeight: 800,
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

  Menu.setApplicationMenu(null); // 去掉顶层菜单

  /* 事件监听和拦截协议的绑定 */
  ipc();

  try {
    ipcRemoteHandle();
    xiaohongshuHandle();
    nodeNimHandleLogin();
  } catch {}

  processWindow.on('closed', handleProcessWindowClosed);

  webRequest();
}