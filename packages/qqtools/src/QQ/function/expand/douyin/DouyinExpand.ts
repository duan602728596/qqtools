import { message } from 'antd';
import type { MessageInstance } from 'antd/es/message/interface';
import getDouyinWorker from './douyin.worker/getDouyinWorker';
import getLimitingWorker from './limiting.worker/getLimitingWorker';
import { getABResult } from '../../../sdk/AB';
import { UserAgent } from './UserAgent';
import type { QQModals } from '../../../QQBotModals/ModalTypes';
import type { OptionsItemDouyin } from '../../../../commonTypes';
import type { ParserResult } from '../../parser';

interface DouyinMessageData {
  type: 'message';
  sendGroup: Array<ParserResult[] | string>;
}

interface DouyinSignData {
  type: 'sign';
  id: string;
  result: string;
}

type MessageListener = (event: MessageEvent<DouyinMessageData | DouyinSignData>) => void | Promise<void>;

/* 抖音监听 */
class DouyinExpand {
  private static limitingWorker: SharedWorker;

  static {
    this.limitingWorker = getLimitingWorker();

    this.limitingWorker.port.addEventListener('message', function(event: MessageEvent): void {
      console.log(event.data);
    });

    this.limitingWorker.port.start();
  }

  public config: OptionsItemDouyin;
  public qq: QQModals;
  public douyinWorker?: Worker;
  #messageApi: typeof message | MessageInstance = message;

  constructor({ config, qq, messageApi }: {
    config: OptionsItemDouyin;
    qq: QQModals;
    messageApi?: MessageInstance;
  }) {
    this.config = config;
    this.qq = qq;
    messageApi && (this.#messageApi = messageApi);
  }

  // 抖音监听
  handleDouyinMessage: MessageListener = async (event: MessageEvent<DouyinMessageData | DouyinSignData>): Promise<void> => {
    if (event.data.type === 'message') {
      for (let i: number = event.data.sendGroup.length - 1; i >= 0; i--) {
        await this.qq.sendMessageText(event.data.sendGroup[i] as any);
      }
    } else if (event.data.type === 'sign' && this.douyinWorker) {
      this.douyinWorker.postMessage({
        type: 'sign',
        id: event.data.id,
        result: await getABResult(event.data.result, '', UserAgent.UA)
      });
    }
  };

  // 抖音监听初始化
  initDouyinWorker(): void {
    const {
      douyinListener,
      userId,
      description,
      cookieString,
      intervalTime,
      isSendDebugMessage
    }: OptionsItemDouyin = this.config;

    if (!(douyinListener && userId && !/^\s*$/.test(userId))) return;

    this.douyinWorker = getDouyinWorker();
    this.douyinWorker.addEventListener('message', this.handleDouyinMessage);
    this.douyinWorker.postMessage({
      userId,
      description,
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