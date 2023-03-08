import { setTimeout as setTimeoutPromise } from 'node:timers/promises';
import type { Browser, BrowserContext, Page, Cookie, Route } from 'playwright-core';
import { message } from 'antd';
import * as dayjs from 'dayjs';
import { getBrowser } from '../../../../utils/utils';
import getDouyinWorker from './douyin.worker/getDouyinWorker';
import { getDouyinServerPort } from '../../../../utils/douyinServer/douyinServer';
import type { QQProtocol, QQModals } from '../../../QQBotModals/ModalTypes';
import type { OptionsItemDouyin } from '../../../../commonTypes';
import type { ParserResult } from '../../parser';

interface DouyinMessageData {
  type: 'message';
  sendGroup: Array<ParserResult[] | string>;
}

type MessageListener = (event: MessageEvent<DouyinMessageData>) => void | Promise<void>;

/* 抖音监听 */
class DouyinExpand {
  /**
   * 由于抖音未登录账号出现验证码中间页，
   * 所以需要提前获取到cookie
   */
  static async getCookie(this: DouyinExpand, executablePath: string, userId: string): Promise<void> {
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
      await setTimeoutPromise(3_000);
      this.cookie = await context.cookies();
      await page.close();
      await browser.close();
    } catch (err) {
      console.error(err);
      browser && (await browser.close());
    }

    browser = null;
  }

  public config: OptionsItemDouyin;
  public qq: QQModals;
  public protocol: QQProtocol;
  public douyinWorker?: Worker;
  public cookie: Array<Cookie> = [];

  constructor({ config, qq, protocol }: {
    config: OptionsItemDouyin;
    qq: QQModals;
    protocol: QQProtocol;
  }) {
    this.config = config;
    this.qq = qq;
    this.protocol = protocol;
  }

  // 抖音监听
  handleDouyinMessage: MessageListener = async (event: MessageEvent<DouyinMessageData>): Promise<void> => {
    if (event.data.type === 'message') {
      for (let i: number = event.data.sendGroup.length - 1; i >= 0; i--) {
        await this.qq.sendMessage(event.data.sendGroup[i] as any);
      }
    }
  };

  // 抖音监听初始化
  async initDouyinWorker(): Promise<void> {
    const { douyinListener, userId, intervalTime, isSendDebugMessage }: OptionsItemDouyin = this.config;

    if (!(douyinListener && userId && !/^\s*$/.test(userId))) return;

    const executablePath: string | null = localStorage.getItem('PUPPETEER_EXECUTABLE_PATH');

    if (!(executablePath && !/^\s*$/.test(executablePath))) {
      message.warning('请先配置无头浏览器！');
      console.warn('请先配置无头浏览器！');

      return;
    }

    if (this.cookie.length <= 0) {
      await DouyinExpand.getCookie.call(this, executablePath, this.config.userId);

      const SVWebId: Cookie | undefined = this.cookie.find((item: Cookie): boolean => item.name === 's_v_web_id');

      if (SVWebId) {
        message.info(`预计过期时间为：${ dayjs.unix(SVWebId.expires).format('YYYY-MM-DD HH:mm:ss') }`);
      }
    }

    this.douyinWorker = getDouyinWorker();
    this.douyinWorker.addEventListener('message', this.handleDouyinMessage);
    this.douyinWorker.postMessage({
      userId: this.config.userId,
      description: this.config.description,
      protocol: this.protocol,
      executablePath,
      port: getDouyinServerPort().port,
      intervalTime,
      cookie: this.cookie,
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