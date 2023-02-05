import { message } from 'antd';
import getDouyinWorker from '../utils/douyin.worker/getDouyinWorker';
import type { OptionsItemDouyin } from '../../commonTypes';
import type QQ from '../QQ';
import type OicqQQ from '../OicqQQ';

type MessageListener = (event: MessageEvent) => void | Promise<void>;

/* 抖音监听 */
class DouyinExpand {
  public config: OptionsItemDouyin;
  public qq: QQ | OicqQQ;
  public protocol: 'mirai' | 'oicq';
  public douyinWorker?: Worker;

  constructor({ config, qq, protocol }: {
    config: OptionsItemDouyin;
    qq: QQ | OicqQQ;
    protocol: 'mirai' | 'oicq';
  }) {
    this.config = config;
    this.qq = qq;
    this.protocol = protocol;
  }

  // 微博监听
  handleDouyinMessage: MessageListener = async (event: MessageEvent): Promise<void> => {
    await this.qq.sendMessage(event.data.sendGroup);
  };

  // 抖音监听初始化
  initDouyinWorker(): void {
    const { douyinListener, userId }: OptionsItemDouyin = this.config;

    if (!(douyinListener && userId && !/^\s*$/.test(userId))) return;

    const executablePath: string | null = localStorage.getItem('PUPPETEER_EXECUTABLE_PATH');

    if (!(executablePath && !/^\s*$/.test(executablePath))) {
      message.warning('请先配置无头浏览器！');
      console.warn('请先配置无头浏览器！');

      return;
    }

    this.douyinWorker = getDouyinWorker();
    this.douyinWorker.addEventListener('message', this.handleDouyinMessage);
    this.douyinWorker.postMessage({
      userId: this.config.userId,
      protocol: this.protocol
    });
  }

  // 销毁
  destroy(): void {
    // 销毁微博监听
    if (this.douyinWorker) {
      this.douyinWorker.postMessage({
        close: true
      });
      this.douyinWorker.terminate();
      this.douyinWorker = undefined;
    }
  }
}

export default DouyinExpand;