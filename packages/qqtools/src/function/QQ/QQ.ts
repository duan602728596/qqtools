import { message } from 'antd';
import NIM_SDK from 'SDK';
import { requestAuth, requestVerify, requestRelease } from './services/services';
import type { OptionsItemValue } from '../../types';
import type { AuthResponse, MessageResponse } from './qq.types';

type MessageListener = (event: MessageEvent) => void | Promise<void>;

const { Chatroom }: any = NIM_SDK;

class QQ {
  public id: string;
  public config: OptionsItemValue;
  public eventSocket: WebSocket;
  public messageSocket: WebSocket;
  public session: string;

  constructor(id: string, config: OptionsItemValue) {
    this.id = id;         // 当前登陆的唯一id
    this.config = config; // 配置
  }

  // message事件监听
  handleMessageSocketMessage: MessageListener = (event: MessageEvent): void => {
    console.log(event);
  }

  // socket事件监听
  handleEventSocketMessage: MessageListener = (event: MessageEvent): void => {
    console.log(event);
  };

  // 获取session
  async getSession(): Promise<boolean> {
    const { qqNumber, socketPort, authKey }: OptionsItemValue = this.config;
    const authRes: AuthResponse = await requestAuth(socketPort, authKey);

    if (authRes.code !== 0) {
      message.error('登陆失败：获取session失败。');

      return false;
    }

    this.session = authRes.session;

    const verifyRes: MessageResponse = await requestVerify(qqNumber, socketPort, this.session);

    if (verifyRes.code === 0) {
      return true;
    } else {
      message.error('登陆失败：session认证失败。');

      return false;
    }
  }

  // websocket初始化
  initWebSocket(): void {
    const { socketPort }: OptionsItemValue = this.config;

    this.messageSocket = new WebSocket(`ws://localhost:${ socketPort }/message?sessionKey=${ this.session }`);
    this.eventSocket = new WebSocket(`ws://localhost:${ socketPort }/event?sessionKey=${ this.session }`);

    this.messageSocket.addEventListener('message', this.handleMessageSocketMessage, false);
    this.eventSocket.addEventListener('message', this.handleEventSocketMessage, false);
  }

  // 项目初始化
  async init(): Promise<boolean> {
    try {
      const result: boolean = await this.getSession();

      if (!result) throw new Error('登陆失败！');

      return true;
    } catch (err) {
      console.error(err);

      return false;
    }
  }

  // 项目销毁
  async destroy(): Promise<boolean> {
    const { qqNumber, socketPort }: OptionsItemValue = this.config;

    try {
      await requestRelease(qqNumber, socketPort, this.session); // 清除session

      return true;
    } catch (err) {
      console.error(err);

      return false;
    }
  }
}

export default QQ;