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

  // 微博监听
  handleWeiboWorkerMessage: MessageListener = async (event: MessageEvent): Promise<void> => {
    await this.qq.sendMessage(event.data.sendGroup);
  };

  // 初始化
  initXiaohongshuWorker(): void {
    const { xiaohongshuListener, userId, cacheFile }: OptionsItemXiaohongshu = this.config;
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
      cacheFile
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