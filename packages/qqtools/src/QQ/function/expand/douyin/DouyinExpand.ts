import { message } from 'antd';
import type { MessageInstance } from 'antd/es/message/interface';
import getDouyinWorker from './douyin.worker/getDouyinWorker';
import getLimitingWorker from './limiting.worker/getLimitingWorker';
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
  handleDouyinMessage: MessageListener = async (event: MessageEvent<DouyinMessageData>): Promise<void> => {
    if (event.data.type === 'message') {
      for (let i: number = event.data.sendGroup.length - 1; i >= 0; i--) {
        await this.qq.sendMessage(event.data.sendGroup[i] as any);
      }
    }
  };

  // 抖音监听初始化
  initDouyinWorker(): void {
    const {
      douyinListener,
      userId,
      description,
      intervalTime,
      isSendDebugMessage
    }: OptionsItemDouyin = this.config;

    if (!(douyinListener && userId && !/^\s*$/.test(userId))) return;

    this.douyinWorker = getDouyinWorker();
    this.douyinWorker.addEventListener('message', this.handleDouyinMessage);
    this.douyinWorker.postMessage({
      userId,
      description,
      protocol: this.protocol,
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