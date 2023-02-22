import { isDevelopment } from './utils.js';
import * as log from './log.js';
import Oicq from './Oicq/Oicq.js';
import type { Config } from './types.js';

/* 登录oicq */
function oicqLogin(config: Config): Promise<Oicq> {
  return new Promise((resolve: Function, reject: Function): void => {
    const oicq: Oicq = new Oicq({
      config,
      onlineSuccessCallback: (): void => resolve(oicq),
      onFailedCallback: (): void => reject()
    });
  });
}

async function main(): Promise<void> {
  let config: Config;

  // 加载配置文件
  try {
    if (isDevelopment) {
      config = await import('../config.dev.js');
    } else {
      // @ts-ignore
      // eslint-disable-next-line import/no-unresolved
      config = await import('./config.js');
    }
  } catch (err) {
    return log.error(err);
  }

  const oicq: Oicq = await oicqLogin(config);
}

main();