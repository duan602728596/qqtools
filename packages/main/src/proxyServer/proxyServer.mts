import * as path from 'node:path';
import { Worker } from 'node:worker_threads';
import { ipcMain, type IpcMainEvent } from 'electron';
import { isDevelopment, workerProductionBasePath, metaHelper, type MetaHelperResult } from '../utils.mjs';
import { ProxyServerChannel } from '../channelEnum.js';

const { __dirname }: MetaHelperResult = metaHelper(globalThis.__IMPORT_META_URL__ ?? import.meta.url);
let proxyServerWorker: Worker | null = null; // proxy-server服务线程

export interface ProxyServerArg {
  port: number;
}

/* 关闭代理服务 */
export async function proxyServerClose(): Promise<void> {
  if (proxyServerWorker) {
    await proxyServerWorker.terminate();
    proxyServerWorker = null;
  }
}

/* 新线程启动代理服务 */
export function proxyServerInit(): void {
  ipcMain.on(ProxyServerChannel.ProxyServer, async function(event: IpcMainEvent, arg: ProxyServerArg): Promise<void> {
    await proxyServerClose();

    proxyServerWorker = new Worker(
      isDevelopment
        ? path.join(__dirname, 'httpProxyServer.worker.mjs')
        : path.join(workerProductionBasePath, 'proxyServer/httpProxyServer.worker.mjs'),
      {
        workerData: {
          ...arg,
          isDevelopment
        }
      }
    );
  });
}