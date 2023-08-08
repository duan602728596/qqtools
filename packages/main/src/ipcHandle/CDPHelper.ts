import { setTimeout as setTimeoutPromise } from 'node:timers/promises';
import * as ChromeLauncher from 'chrome-launcher';
import type { LaunchedChrome } from 'chrome-launcher';
import type { Protocol } from 'devtools-protocol';
import type { Client } from 'chrome-remote-interface';

/**
 * 启动浏览器
 * @param { string } executablePath: 浏览器地址
 * @param { number } port: 端口地址
 */
export function chromeStart(executablePath: string, port: number): Promise<LaunchedChrome> {
  return ChromeLauncher.launch({
    chromePath: executablePath,
    port,
    chromeFlags: ['--disable-gpu', '--window-size=400,400']
  });
}

/**
 * 切换到指定tab
 * @param { Client | null } client
 */
export async function clientSwitch(client: Client | null, host: string): Promise<void> {
  if (client) {
    const { targetInfos }: Protocol.Target.GetTargetsResponse = await client.Target.getTargets();
    const xiaohongshuTarget: Protocol.Target.TargetInfo | undefined = targetInfos.find(
      (target: Protocol.Target.TargetInfo): boolean => target.type === 'page' && target.url.includes(host));

    if (xiaohongshuTarget && !xiaohongshuTarget.attached) {
      await client.Target.attachToTarget({ targetId: xiaohongshuTarget.targetId });
    }
  }
}

/**
 * 等待dom出现
 * @param { Client } client
 * @param { string } expression
 */
export async function waitingDomFunction(client: Client, expression: string): Promise<void> {
  let waitingDom: boolean = true;

  // 等待dom出现
  while (waitingDom) {
    const result: Protocol.Runtime.EvaluateResponse = await client.Runtime.evaluate({ expression });

    if (result.result.value) {
      waitingDom = false;
    } else {
      await setTimeoutPromise(1_000);
    }
  }

  await setTimeoutPromise(5_000);
}