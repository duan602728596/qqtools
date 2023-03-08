import { message } from 'antd';
import type { Browser, BrowserContext, Page, Cookie } from 'playwright-core';
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
        viewport: {
          width: 500,
          height: 400
        }
      });
      const page: Page = await context.newPage();
      const userUrl: string = `https://www.douyin.com/user/${ userId }`;

      await page.goto(userUrl, { referer: userUrl, timeout: 0 });
      await page.waitForFunction(
        (): boolean => !!document.getElementById('RENDER_DATA'), { timeout: 0 });
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
    const { douyinListener, userId, intervalTime }: OptionsItemDouyin = this.config;

    if (!(douyinListener && userId && !/^\s*$/.test(userId))) return;

    const executablePath: string | null = localStorage.getItem('PUPPETEER_EXECUTABLE_PATH');

    if (!(executablePath && !/^\s*$/.test(executablePath))) {
      message.warning('请先配置无头浏览器！');
      console.warn('请先配置无头浏览器！');

      return;
    }

    if (this.cookie.length <= 0) {
      await DouyinExpand.getCookie.call(this, executablePath, this.config.userId);
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
      cookie: this.cookie
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