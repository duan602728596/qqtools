import { message } from 'antd';
import type { MessageInstance } from 'antd/es/message/interface';
import getXiaohongshuWorker from './xiaohongshu.worker/getXiaohongshuWorker';
import { getExecutablePath } from '../../../../utils/utils';
import type { QQProtocol, QQModals } from '../../../QQBotModals/ModalTypes';
import type { OptionsItemXiaohongshu } from '../../../../commonTypes';

type MessageListener = (event: MessageEvent) => void | Promise<void>;

/* 小红书 */
class XiaohongshuExpand {
  public config: OptionsItemXiaohongshu;
  public qq: QQModals;
  public protocol: QQProtocol;
  public userId: string; // 用户ID
  public xiaohongshuWorker?: Worker; // 监听
  #messageApi: typeof message | MessageInstance = message;

  constructor({ config, qq, protocol, messageApi }: {
    config: OptionsItemXiaohongshu;
    qq: QQModals;
    protocol: QQProtocol;
    messageApi?: MessageInstance;
  }) {
    this.config = config;
    this.qq = qq;
    this.protocol = protocol;
    messageApi && (this.#messageApi = messageApi);
  }

  // 小红书监听
  handleWeiboWorkerMessage: MessageListener = async (event: MessageEvent): Promise<void> => {
    if (event.data.type === 'message') {
      for (let i: number = event.data.sendGroup.length - 1; i >= 0; i--) {
        await this.qq.sendMessage(event.data.sendGroup[i] as any);
      }
    }
  };

  // 初始化
  initXiaohongshuWorker(): void {
    const { xiaohongshuListener, userId, cookieString, description, cacheFile, isSendDebugMessage }: OptionsItemXiaohongshu = this.config;
    const executablePath: string | null = getExecutablePath();

    if (!executablePath) {
      message.warning('小红书监听需要配置无头浏览器！');

      return;
    }

    if (!(xiaohongshuListener && userId && cacheFile)) return;

    this.userId = userId;
    this.xiaohongshuWorker = getXiaohongshuWorker();
    this.xiaohongshuWorker.addEventListener('message', this.handleWeiboWorkerMessage, false);
    this.xiaohongshuWorker.postMessage({
      userId: this.userId,
      cacheFile,
      executablePath,
      protocol: this.protocol,
      cookieString,
      description,
      isSendDebugMessage
    });
  }

  // 销毁
  destroy(): void {
    // 销毁微博监听
    if (this.xiaohongshuWorker) {
      this.xiaohongshuWorker.terminate();
      this.xiaohongshuWorker = undefined;
    }
  }
}

export default XiaohongshuExpand;