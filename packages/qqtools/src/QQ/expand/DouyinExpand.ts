import { message } from 'antd';
import getDouyinWorker from '../utils/douyin.worker/getDouyinWorker';
import { getDouyinServerPort } from '../../utils/douyinServer/douyinServer';
import type { OptionsItemDouyin } from '../../commonTypes';
import type MiraiQQ from '../QQBotModals/MiraiQQ';
import type OicqQQ from '../QQBotModals/OicqQQ';
import type GoCQHttp from '../QQBotModals/GoCQHttp';
import type { MessageChain } from '../qq.types';

interface DouyinMessageData {
  type: 'message';
  sendGroup: Array<MessageChain[] | string>;
}

type MessageListener = (event: MessageEvent<DouyinMessageData>) => void | Promise<void>;

/* 抖音监听 */
class DouyinExpand {
  public config: OptionsItemDouyin;
  public qq: MiraiQQ | OicqQQ | GoCQHttp;
  public protocol: 'mirai' | 'oicq' | 'go-cqhttp';
  public douyinWorker?: Worker;

  constructor({ config, qq, protocol }: {
    config: OptionsItemDouyin;
    qq: MiraiQQ | OicqQQ | GoCQHttp;
    protocol: 'mirai' | 'oicq' | 'go-cqhttp';
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
  initDouyinWorker(): void {
    const { douyinListener, userId, intervalTime }: OptionsItemDouyin = this.config;

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
      description: this.config.description,
      protocol: this.protocol,
      executablePath,
      port: getDouyinServerPort().port,
      intervalTime
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