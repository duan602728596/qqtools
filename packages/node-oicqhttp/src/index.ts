import { isDevelopment } from './utils.js';
import * as log from './log.js';
import type { Config } from './types.js';

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
}

main();