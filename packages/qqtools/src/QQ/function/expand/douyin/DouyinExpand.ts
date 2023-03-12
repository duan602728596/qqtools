import type { Browser, BrowserContext, Page, Cookie, Route, JSHandle } from 'playwright-core';
import { message } from 'antd';
import type { MessageInstance } from 'antd/es/message/interface';
import { getBrowser } from '../../../../utils/utils';
import getDouyinWorker from './douyin.worker/getDouyinWorker';
import { getDouyinServerPort } from '../../../../utils/proxyServer/proxyServer';
import * as toutiaosdk from '../../../sdk/toutiao/toutiaosdk';
import type { QQProtocol, QQModals } from '../../../QQBotModals/ModalTypes';
import type { OptionsItemDouyin } from '../../../../commonTypes';
import type { ParserResult } from '../../parser';
import type { UserScriptRendedData } from '../../../qq.types';

interface DouyinMessageData {
  type: 'message';
  sendGroup: Array<ParserResult[] | string>;
}

interface XBogusMessageData {
  type: 'X-Bogus';
}

type MessageListener = (event: MessageEvent<DouyinMessageData | XBogusMessageData>) => void | Promise<void>;

/* 抖音监听 */
class DouyinExpand {
  private static getCookie: any;
  /**
   * 由于抖音未登录账号出现验证码中间页
   * 获取renderData
   */
  static async getRenderData(executablePath: string, userId: string): Promise<UserScriptRendedData | undefined> {
    let browser: Browser | null = null;

    try {
      browser = await getBrowser(executablePath).launch({
        headless: false,
        executablePath: decodeURIComponent(executablePath),
        timeout: 1_500_000
      });
      const context: BrowserContext = await browser.newContext({
        ignoreHTTPSErrors: true,
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) '
          + 'Chrome/109.0.0.0 Safari/537.36 Edg/109.0.1518.52',
        serviceWorkers: 'block',
        viewport: { width: 500, height: 400 }
      });

      await context.route(
        (url: URL): boolean => !(
          (/^\/user\//i.test(url.pathname) && /douyin\.com/i.test(url.hostname))
          || (
            /captcha\/index\.js/i.test(url.pathname) // 验证码文件
            || /(vcs|verify)\.snssdk\.com/i.test(url.hostname)
            || /static\/secsdk-captcha/i.test(url.pathname)
            || /monitor_web\/settings\/browser-settings/i.test(url.pathname)
            || /captcha\/get/i.test(url.pathname)
            || /slardar\/fe\/sdk-web\/plugins\/common-monitors/i.test(url.pathname)
            || (/catpcha\.byteimg\.com/i.test(url.hostname) && /tplv/.test(url.pathname))
            || (/verify.zijieapi.com/i.test(url.hostname) && /captcha\/verify/.test(url.pathname))
          )
        ),
        (route: Route): Promise<void> => route.abort());

      const page: Page = await context.newPage();
      const userUrl: string = `https://www.douyin.com/user/${ userId }`;

      page.setDefaultTimeout(0);
      await page.goto(userUrl, { referer: userUrl, timeout: 0 });
      await page.waitForFunction((): boolean => !!document.getElementById('RENDER_DATA'));

      const renderDataHandle: JSHandle<string | null> = await page.evaluateHandle((): string | null => {
        const scriptElement: HTMLElement | null = document.getElementById('RENDER_DATA');

        return scriptElement ? scriptElement.innerHTML : null;
      });
      const renderData: string | null = await renderDataHandle.evaluate(
        (node: string | null): string | null => node ? decodeURIComponent(node) : null);
      const renderDataJson: UserScriptRendedData | undefined = renderData ? JSON.parse(renderData) : undefined;

      await page.close();
      await browser.close();

      return renderDataJson;
    } catch (err) {
      console.error(err);
      await browser?.close?.();
    }

    browser = null;
  }

  public config: OptionsItemDouyin;
  public qq: QQModals;
  public protocol: QQProtocol;
  public douyinWorker?: Worker;
  #messageApi: typeof message | MessageInstance = message;

  constructor({ config, qq, protocol, messageApi }: {
    config: OptionsItemDouyin;
    qq: QQModals;
    protocol: QQProtocol;
    messageApi?: MessageInstance;
  }) {
    this.config = config;
    this.qq = qq;
    this.protocol = protocol;
    messageApi && (this.#messageApi = messageApi);
  }

  // 抖音监听
  handleDouyinMessage: MessageListener = async (event: MessageEvent<DouyinMessageData | XBogusMessageData>): Promise<void> => {
    if (event.data.type === 'message') {
      for (let i: number = event.data.sendGroup.length - 1; i >= 0; i--) {
        await this.qq.sendMessage(event.data.sendGroup[i] as any);
      }
    } else if (event.data.type === 'X-Bogus') {
      const frontierSign: { 'X-Bogus'?: string } = {};

      await toutiaosdk.webmssdkES5('frontierSign', [frontierSign]);
      this.douyinWorker!.postMessage({
        type: 'X-Bogus',
        value: frontierSign['X-Bogus']
      });
    }
  };

  // 抖音监听初始化
  initDouyinWorker(): void {
    const {
      douyinListener,
      userId,
      webId,
      description,
      intervalTime,
      cookieString,
      isSendDebugMessage
    }: OptionsItemDouyin = this.config;

    if (!douyinListener) return;

    if (!(userId && webId && cookieString && !/^\s*$/.test(userId) && !/^\s*$/.test(webId) && !/^\s*$/.test(cookieString))) {
      this.#messageApi.warning('配置缺少userId、webId或cookie，抖音监听功能将不会启动');

      return;
    }

    this.douyinWorker = getDouyinWorker();
    this.douyinWorker.addEventListener('message', this.handleDouyinMessage);
    this.douyinWorker.postMessage({
      userId,
      webId,
      description,
      protocol: this.protocol,
      port: getDouyinServerPort().port,
      cookieString,
      intervalTime,
      isSendDebugMessage
    });
  }

  // 销毁
  destroy(): void {
    if (this.douyinWorker) {
      this.douyinWorker.postMessage({ close: true });
      this.douyinWorker.terminate();
      this.douyinWorker = undefined;
    }
  }
}

export default DouyinExpand;