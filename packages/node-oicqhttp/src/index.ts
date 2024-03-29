import * as path from 'node:path';
import * as process from 'node:process';
import { pathToFileURL } from 'node:url';
import { isDevelopment, dynamicImport } from './utils.js';
import Oicq from './Oicq/Oicq.js';
import Server from './Server/Server.js';
import type { Config, ConfigImport } from './types.js';

/* 登录oicq */
function oicqLogin(config: Config): Promise<Oicq> {
  return new Promise((resolve: Function, reject: Function): void => {
    const oicq: Oicq = new Oicq({
      config,
      onlineSuccessCallback: (): void => resolve(oicq),
      onFailedCallback: (): void => reject()
    });

    oicq.init();
  });
}

async function main(): Promise<void> {
  let config: Config;

  // 加载配置文件
  try {
    if (isDevelopment) {
      const configModule: ConfigImport = await dynamicImport<ConfigImport>('../config.dev.mjs');

      config = configModule.default;
    } else {
      const configModule: ConfigImport
        = await dynamicImport<ConfigImport>(pathToFileURL(path.join(process.cwd(), 'config.mjs')).href);

      config = configModule.default;
    }
  } catch (err) {
    return console.error(err);
  }

  const oicq: Oicq = await oicqLogin(config);
  const server: Server = new Server({
    port: config.port,
    client: oicq.client
  });

  server.init();
}

main();