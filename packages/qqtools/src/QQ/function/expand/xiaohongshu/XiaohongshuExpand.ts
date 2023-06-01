import { ipcRenderer } from 'electron';
import { message } from 'antd';
import type { MessageInstance } from 'antd/es/message/interface';
import getXiaohongshuWorker from './xiaohongshu.worker/getXiaohongshuWorker';
import type { QQProtocol, QQModals } from '../../../QQBotModals/ModalTypes';
import type { OptionsItemXiaohongshu } from '../../../../commonTypes';
import type { XHSProtocol } from './xiaohongshu.worker/messageTypes';

type MessageListener = (event: MessageEvent) => void | Promise<void>;

/* 小红书 */
class XiaohongshuExpand {
  public config: OptionsItemXiaohongshu;
  public qq: QQModals;
  public protocol: QQProtocol;
  public userId: string; // 用户ID
  public xiaohongshuWorker?: Worker; // 监听
  public port: number;
  public cookie: string;
  public signProtocol: XHSProtocol;
  #messageApi: typeof message | MessageInstance = message;

  static windowInit(): Promise<void> {
    return ipcRenderer.invoke('xiaohongshu-window-init');
  }

  static cookie(port: number): Promise<string> {
    return ipcRenderer.invoke('xiaohongshu-cookie', port);
  }

  static destroy(): Promise<void> {
    return ipcRenderer.invoke('xiaohongshu-destroy');
  }

  static chromeDevtoolsInit(executablePath: string, port: number): Promise<void> {
    return ipcRenderer.invoke('xiaohongshu-chrome-remote-init', executablePath, port);
  }

  static chromeDevtoolCookie(): Promise<string> {
    return ipcRenderer.invoke('xiaohongshu-chrome-remote-cookie');
  }

  constructor({ config, qq, protocol, messageApi, port, cookie, signProtocol }: {
    config: OptionsItemXiaohongshu;
    qq: QQModals;
    protocol: QQProtocol;
    port: number;
    cookie: string;
    signProtocol: XHSProtocol;
    messageApi?: MessageInstance;
  }) {
    this.config = config;
    this.qq = qq;
    this.protocol = protocol;
    this.port = port;
    this.cookie = cookie;
    this.signProtocol = signProtocol;
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
    const { xiaohongshuListener, userId, description, cacheFile, isSendDebugMessage }: OptionsItemXiaohongshu = this.config;

    if (!(xiaohongshuListener && userId && cacheFile)) return;

    this.userId = userId;
    this.xiaohongshuWorker = getXiaohongshuWorker();
    this.xiaohongshuWorker.addEventListener('message', this.handleWeiboWorkerMessage, false);
    this.xiaohongshuWorker.postMessage({
      userId: this.userId,
      cacheFile,
      protocol: this.protocol,
      signProtocol: this.signProtocol,
      cookieString: this.cookie,
      port: this.port,
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