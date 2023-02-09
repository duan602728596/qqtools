import * as path from 'node:path';
import * as process from 'node:process';
import { Worker } from 'node:worker_threads';
import { ipcMain, type IpcMainEvent } from 'electron';
import { isDevelopment } from '../utils';

export const type: string = 'douyin-server';
let douyinServerWorker: Worker | null = null; // proxy-server服务线程

export interface ProxyServerArg {
  port: number;
}

/* 关闭代理服务 */
export async function douyinServerClose(): Promise<void> {
  if (douyinServerWorker) {
    await douyinServerWorker.terminate();
    douyinServerWorker = null;
  }
}

/* 新线程启动代理服务 */
export function douyinServerInit(): void {
  ipcMain.on(type, async function(event: IpcMainEvent, arg: ProxyServerArg): Promise<void> {
    await douyinServerClose();

    douyinServerWorker = new Worker(
      isDevelopment
        ? path.join(__dirname, 'httpDouyinServer.worker.js')
        : path.join(process.resourcesPath, 'app.asar.unpacked/bin/lib/proxyServer/httpDouyinServer.worker.js'),
      {
        workerData: {
          ...arg,
          isDevelopment
        }
      }
    );
  });
}