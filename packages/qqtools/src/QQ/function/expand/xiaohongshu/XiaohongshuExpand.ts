import { ipcRenderer } from 'electron';
import { message } from 'antd';
import type { MessageInstance } from 'antd/es/message/interface';
import { XiaohongshuHandleChannel } from '@qqtools3/main/src/channelEnum';
import type { SignResult, UserPostedResponse, PostedNoteItem } from '@qqtools-api/xiaohongshu';
import getXiaohongshuWorker from './xiaohongshu.worker/getXiaohongshuWorker';
import { parseHtml, type XiaohongshuInitialState, type NoteItem } from './function/parseHtml';
import type { QQProtocol, QQModals } from '../../../QQBotModals/ModalTypes';
import type { OptionsItemXiaohongshu } from '../../../../commonTypes';
import type { XHSProtocol } from './xiaohongshu.worker/messageTypes';
import type { MessageListener } from '../../../QQBotModals/Basic';

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
    return ipcRenderer.invoke(XiaohongshuHandleChannel.XiaohongshuWindowInit);
  }

  static cookie(port: number): Promise<string> {
    return ipcRenderer.invoke(XiaohongshuHandleChannel.XiaohongshuCookie, port);
  }

  static destroy(): Promise<void> {
    return ipcRenderer.invoke(XiaohongshuHandleChannel.XiaohongshuDestroy);
  }

  static chromeDevtoolsInit(executablePath: string, port: number): Promise<void> {
    return ipcRenderer.invoke(XiaohongshuHandleChannel.XiaohongshuChromeRemoteInit, executablePath, port);
  }

  static chromeDevtoolCookie(): Promise<string> {
    return ipcRenderer.invoke(XiaohongshuHandleChannel.XiaohongshuChromeRemoteCookie);
  }

  static async chromeDevtoolsSign(reqPath: string, data: string | undefined): Promise<SignResult> {
    const result: string = await ipcRenderer.invoke(XiaohongshuHandleChannel.XiaohongshuChromeRemoteSign, reqPath, data);

    return JSON.parse(result);
  }

  static async chromeDevtoolsRequestHtml(u: string): Promise<UserPostedResponse | undefined> {
    const result: string | void = await ipcRenderer.invoke(XiaohongshuHandleChannel.XiaohongshuChromeRemoteRequestHtml, u);

    if (result) {
      const initialState: XiaohongshuInitialState | undefined = parseHtml(result);

      if (initialState) {
        return {
          code: 0,
          success: true,
          data: {
            cursor: '',
            has_more: false,
            notes: initialState.user.notes.flat().map((o: NoteItem): PostedNoteItem => ({
              type: o.noteCard.type,
              note_id: o.noteCard.noteId,
              cover: { url: o.noteCard.cover.urlDefault }
            }))
          }
        };
      }
    }
  }

  // 图片转base64
  static imageToBase64(url: string): Promise<string> {
    return new Promise((resolve: Function, reject: Function): void => {
      const img: HTMLImageElement = new Image();

      img.addEventListener('load', function(): void {
        let canvas: HTMLCanvasElement | null = document.createElement('canvas');

        canvas.width = img.width;
        canvas.height = img.height;

        const context: CanvasRenderingContext2D = canvas.getContext('2d')!;

        context.drawImage(img, 0, 0);

        const base64: string = canvas.toDataURL('image/png');

        canvas = null;
        resolve(base64);
      }, { once: true });

      img.src = url;
    });
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
    } else if (event.data.type === 'sign') {
      this.xiaohongshuWorker?.postMessage?.({
        type: 'sign',
        id: event.data.id,
        result: await XiaohongshuExpand.chromeDevtoolsSign(event.data.url, event.data.data)
      });
    } else if (event.data.type === 'imageToBase64') {
      this.xiaohongshuWorker?.postMessage({
        type: 'imageToBase64',
        id: event.data.id,
        result: await XiaohongshuExpand.imageToBase64(event.data.imageUrl)
      });
    } else if (event.data.type === 'requestHtml') {
      this.xiaohongshuWorker?.postMessage({
        type: 'requestHtml',
        id: event.data.id,
        result: await XiaohongshuExpand.chromeDevtoolsRequestHtml(event.data.url)
      });
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