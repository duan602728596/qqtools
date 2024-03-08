import * as dayjs from 'dayjs';
import { renderString } from 'nunjucks';
import {
  requestAuth,
  requestAuthV2,
  requestVerify,
  requestVerifyV2,
  requestRelease,
  requestSendGroupMessage,
  requestManagers,
  requestAbout,
  type AuthResponse,
  type MessageResponse,
  type AboutResponse
} from '@qqtools-api/mirai';
import Basic, { type BasicImplement, type MessageListener, type BasicArgs } from './Basic';
import { QQProtocol } from './ModalTypes';
import { plain, type MiraiMessageProps } from '../function/parser/mirai';
import { getGroupNumbers, getSocketHost, LogCommandData } from '../function/qq/qqUtils';
import parser, { type ParserResult } from '../function/parser/index';
import * as CQ from '../function/parser/CQ';
import type { OptionsItemValueV2, EditItem } from '../../commonTypes';
import type {
  MessageSocketEventData,
  MessageSocketEventDataV2,
  EventSocketEventData,
  EventSocketEventDataV2
} from '../qq.types';

type CloseListener = (event: CloseEvent) => void | Promise<void>;

class MiraiQQ extends Basic implements BasicImplement<Array<MiraiMessageProps>> {
  public protocol: QQProtocol = QQProtocol.Mirai;
  public socketStatus: -1 | 0; // -1 关闭，0 正常
  public eventSocket?: WebSocket;
  public messageSocket?: WebSocket;
  public reconnectTimer: number | null; // 断线重连
  public session: string;
  #miraiApiHttpV2: boolean = false;

  constructor(args: BasicArgs) {
    super(args);

    const { id, config, membersList }: BasicArgs = args;

    this.id = id;         // 当前登陆的唯一id
    this.config = config; // 配置
    this.membersList = membersList;
    this.groupNumbers = getGroupNumbers(this.config.groupNumber);
    this.socketStatus = 0;
    this.socketHost = getSocketHost(config.socketHost);
  }

  // message事件监听
  handleMessageSocketMessage: MessageListener = async (event: MessageEvent): Promise<void> => {
    const { qqNumber, customCmd }: OptionsItemValueV2 = this.config;
    const groupNumbers: Array<number> = this.groupNumbers;
    const eventData: MessageSocketEventData | MessageSocketEventDataV2 = JSON.parse(event.data);
    const data: MessageSocketEventData = 'syncId' in eventData ? eventData.data : eventData;

    // 群信息
    if (data.type === 'GroupMessage' && data.sender.id !== qqNumber && groupNumbers.includes(data.sender.group.id)) {
      if (data.messageChain?.[1].type === 'Plain') {
        const command: string = data.messageChain[1].text; // 当前命令
        const groupId: number = data.sender.group.id;      // 收到消息的群

        // 日志信息输出
        if (command === 'log') {
          this.logCommandCallback(groupId);

          return;
        }

        // 自定义信息处理
        if (customCmd?.length) {
          const customCmdItem: EditItem | undefined = customCmd.find((o: EditItem): boolean => {
            if (o.isRegexp) {
              return new RegExp(o.cmd, 'i').test(command);
            } else {
              return o.cmd === command;
            }
          });

          if (customCmdItem) {
            await this.sendMessageText(customCmdItem.value, groupId);
          }
        }

        // mock
        if (process.env.NODE_ENV === 'development') {
          (await import('../function/mock/mock')).default(this, command, qqNumber, groupId);
        }
      }
    }
  };

  // socket事件监听
  handleEventSocketMessage: MessageListener = async (event: MessageEvent): Promise<void> => {
    const { qqNumber, groupWelcome, groupWelcomeSend }: OptionsItemValueV2 = this.config;
    const groupNumbers: Array<number> = this.groupNumbers;
    const eventData: EventSocketEventData | EventSocketEventDataV2 = JSON.parse(event.data);
    const data: EventSocketEventData = 'syncId' in eventData ? eventData.data : eventData;

    // 欢迎进群
    if (data.type === 'MemberJoinEvent' && data.member.id !== qqNumber && groupNumbers.includes(data.member.group.id)) {
      if (groupWelcome && groupWelcomeSend) {
        const msg: string = renderString(groupWelcomeSend, {
          at: CQ.at(data.member.id)
        });

        await this.sendMessageText(msg, data.member.group.id);
      }
    }
  };

  // socket关闭
  handleSocketClose: CloseListener = (event: CloseEvent): void => {
    if (this.socketStatus === -1 || this.#miraiApiHttpV2) return;

    this.destroyWebsocket(); // 清除旧的socket
    this.reconnectTimer = window.setTimeout(this.reconnectLogin, 3_000);
  };

  // 断线重连
  reconnectLogin: Function = async (): Promise<void> => {
    try {
      const { socketHost }: this = this;
      const { socketPort, qqNumber }: OptionsItemValueV2 = this.config;
      const res: MessageResponse | Array<any> = await requestManagers(socketHost, socketPort, qqNumber);

      if (Array.isArray(res)) {
        const result: boolean = await this.getSession();

        if (result) {
          this.initWebSocket();
        } else {
          this.reconnectTimer = window.setTimeout(this.reconnectLogin, 3_000);
        }
      } else {
        this.reconnectTimer = window.setTimeout(this.reconnectLogin, 3_000);
      }
    } catch (err) {
      console.error(err);
      this.reconnectTimer = window.setTimeout(this.reconnectLogin, 3_000);
    }
  };

  // websocket初始化
  initWebSocket(): void {
    const { socketHost }: this = this;
    const { socketPort, authKey, qqNumber }: OptionsItemValueV2 = this.config;
    const query: string = new URLSearchParams(
      this.#miraiApiHttpV2 ? {
        verifyKey: authKey,
        sessionKey: this.session,
        qq: String(qqNumber)
      } : {
        sessionKey: this.session
      }
    ).toString();

    this.messageSocket = new WebSocket(`ws://${ socketHost }:${ socketPort }/message?${ query }`);
    this.eventSocket = new WebSocket(`ws://${ socketHost }:${ socketPort }/event?${ query }`);
    this.messageSocket.addEventListener('message', this.handleMessageSocketMessage, false);
    this.eventSocket.addEventListener('message', this.handleEventSocketMessage, false);
    this.messageSocket.addEventListener('close', this.handleSocketClose, false);
    this.eventSocket.addEventListener('close', this.handleSocketClose, false);
  }

  // websocket销毁
  destroyWebsocket(): void {
    if (this.eventSocket) {
      this.eventSocket.removeEventListener('message', this.handleEventSocketMessage);
      this.eventSocket.removeEventListener('close', this.handleSocketClose, false);
      this.eventSocket.close();
      this.eventSocket = undefined;
    }

    if (this.messageSocket) {
      this.messageSocket.removeEventListener('message', this.handleMessageSocketMessage);
      this.messageSocket.removeEventListener('close', this.handleSocketClose, false);
      this.messageSocket.close();
      this.messageSocket = undefined;
    }
  }

  // 获取session
  async getSession(): Promise<boolean> {
    const { socketHost }: this = this;
    const { qqNumber, socketPort, authKey }: OptionsItemValueV2 = this.config;

    // 获取插件版本号
    const about: AboutResponse = await requestAbout(socketHost, socketPort);

    this.#miraiApiHttpV2 = /^2/.test(about.data.version);

    const authRes: AuthResponse = await (this.#miraiApiHttpV2 ? requestAuthV2 : requestAuth)(
      socketHost, socketPort, authKey);

    if (authRes.code !== 0) {
      this.messageApi.error('登陆失败：获取session失败。');

      return false;
    }

    this.session = authRes.session;

    const verifyRes: MessageResponse = await (this.#miraiApiHttpV2 ? requestVerifyV2 : requestVerify)(
      qqNumber, socketHost, socketPort, this.session);

    if (verifyRes.code === 0) {
      return true;
    } else {
      this.messageApi.error('登陆失败：session认证失败。');

      return false;
    }
  }

  /**
   * 发送信息
   * @param { Array<MiraiMessageProps> } value - 要发送的信息
   * @param { number } [groupId] - 单个群的群号
   */
  async sendMessage(value: Array<MiraiMessageProps>, groupId?: number): Promise<void> {
    try {
      const { socketHost }: this = this;
      const { socketPort }: OptionsItemValueV2 = this.config;
      const groupNumbers: Array<number> = this.groupNumbers;

      if (typeof groupId === 'number') {
        // 只发送到一个群
        await requestSendGroupMessage(groupId, socketHost, socketPort, this.session, value);
      } else {
        // 发送到多个群
        await Promise.all(
          groupNumbers.map((item: number, index: number): Promise<MessageResponse> => {
            return requestSendGroupMessage(item, socketHost, socketPort, this.session, value);
          })
        );
      }
    } catch (err) {
      console.error(err);
    }
  }

  async sendMessageText(value: string, groupId?: number): Promise<void> {
    const sendValue: ParserResult = parser({
      text: value,
      protocol: this.protocol
    });

    await this.sendMessage(sendValue as Array<MiraiMessageProps>, groupId);
  }

  // 日志回调函数
  async logCommandCallback(groupId: number): Promise<void> {
    const { qqNumber }: OptionsItemValueV2 = this.config;
    const msg: string = LogCommandData(this.protocol, qqNumber, this.startTime);

    await this.sendMessageText(msg, groupId);
  }

  // 项目初始化
  async init(): Promise<boolean> {
    try {
      const result: boolean = await this.getSession();

      if (!result) throw new Error('登陆失败！');

      this.initWebSocket();
      await Basic.initExpand.call(this);
      this.startTime = dayjs().format('YYYY-MM-DD HH:mm:ss');

      return true;
    } catch (err) {
      console.error(err);

      return false;
    }
  }

  // 项目销毁
  async destroy(): Promise<boolean> {
    const { socketHost }: this = this;
    const { qqNumber, socketPort }: OptionsItemValueV2 = this.config;

    try {
      await requestRelease(qqNumber, socketHost, socketPort, this.session); // 清除session
    } catch (err) {
      console.error(err);
    }

    try {
      // 销毁socket监听
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
      }

      this.socketStatus = -1;
      this.destroyWebsocket();
      Basic.destroyExpand.call(this);

      return true;
    } catch (err) {
      console.error(err);

      return false;
    }
  }
}

export default MiraiQQ;