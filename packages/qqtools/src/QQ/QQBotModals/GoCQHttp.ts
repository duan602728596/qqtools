import type { IncomingMessage } from 'node:http';
import { WebSocket as WebSocketClient, WebSocketServer } from 'ws';
import type { GroupMessage, MemberIncreaseEvent as OicqMemberIncreaseEvent } from 'icqq';
import * as dayjs from 'dayjs';
import { renderString } from 'nunjucks';
import Basic, { type BasicImplement, type BasicArgs } from './Basic';
import { QQProtocol } from './ModalTypes';
import {
  getGroupNumbers,
  getSocketHost,
  LogCommandData,
  isGroupMessageEventData,
  isMemberIncreaseEventData
} from '../function/qq/qqUtils';
import * as CQ from '../function/parser/CQ';
import type { OptionsItemValueV2, EditItem } from '../../commonTypes';

export interface HeartbeatMessage {
  post_type: 'meta_event';
  meta_event_type: 'heartbeat';
}

export interface MemberIncreaseEvent extends Omit<OicqMemberIncreaseEvent, 'notice_type' | 'sub_type'> {
  notice_type: 'group_increase';
  sub_type: 'approve' | 'invite';
}

/* go-cqhttp */
class GoCQHttp extends Basic implements BasicImplement<string> {
  static verifyAuthorization(headerAuthorization: string | undefined, token: string): boolean {
    if (headerAuthorization === undefined) return false;

    const authorizationStr: Array<string> = headerAuthorization
      .replace(/^\s+/, '')
      .replace(/\s+$/, '')
      .split(/\s+/);
    const bearerStr: string | undefined = authorizationStr?.[0]?.toLocaleLowerCase?.();
    const authValue: string | undefined = authorizationStr?.[1];

    return ['bearer', 'token'].includes(bearerStr) && authValue === token;
  }

  static getCommand(data: GroupMessage): string {
    const { raw_message: rawMessage, message }: GroupMessage = data;

    if (message?.[0] && message[0].type === 'text') {
      return message[0].text ?? message[0]['data']['text'];
    }

    return rawMessage ?? '';
  }

  public protocol: QQProtocol = QQProtocol.GoCQHttp;
  public websocket: WebSocketClient | WebSocketServer | undefined;

  constructor(args: BasicArgs) {
    super(args);

    const { id, config, membersList }: BasicArgs = args;

    this.id = id;         // 当前登陆的唯一id
    this.config = config; // 配置
    this.membersList = membersList;
    this.groupNumbers = getGroupNumbers(this.config.groupNumber);
    this.socketHost = getSocketHost(config.socketHost);
  }

  // message事件监听
  handleMessageSocketMessage: (buffer: Buffer) => void | Promise<void> = async (buffer: Buffer): Promise<void> => {
    const { qqNumber, customCmd, groupWelcome, groupWelcomeSend }: OptionsItemValueV2 = this.config;
    const groupNumbers: Array<number> = this.groupNumbers;
    const data: GroupMessage | MemberIncreaseEvent | HeartbeatMessage = JSON.parse(buffer.toString());

    if (data.post_type === 'meta_event' && data.meta_event_type === 'heartbeat') return;

    if (isGroupMessageEventData(data) && data.sender.user_id !== qqNumber && groupNumbers.includes(data.group_id)) {
      const { group_id: groupId /* 收到消息的群 */ }: GroupMessage = data;
      const command: string = GoCQHttp.getCommand(data);

      // 日志信息输出
      if (command === 'log') {
        this.logCommandCallback(groupId);

        return;
      }

      // 自定义信息处理
      if (customCmd?.length) {
        const index: number = customCmd.findIndex((o: EditItem): boolean => {
          if (o.isRegexp) {
            return new RegExp(o.cmd, 'i').test(command);
          } else {
            return o.cmd === command;
          }
        });

        if (index >= 0) {
          await this.sendMessage(customCmd[index].value, groupId);
        }
      }

      // mock
      if (process.env.NODE_ENV === 'development') {
        (await import('../function/mock/mock')).default(this, command, qqNumber, groupId);
      }
    }

    if (isMemberIncreaseEventData(data) && data.user_id !== qqNumber && groupNumbers.includes(data.group_id)) {
      if (groupWelcome && groupWelcomeSend) {
        const msg: string = renderString(groupWelcomeSend, {
          at: CQ.at(data.user_id)
        });

        await this.sendMessage(msg, data.group_id);
      }
    }
  };

  // 错误消息
  handleWebsocketError(err: Error): void {
    this.messageApi.error(err.toString());
  }

  // 创建组消息
  createGroupMessage(groupId: number, value: string): string {
    return JSON.stringify({
      action: 'send_group_msg',
      params: {
        group_id: groupId,
        message: value
      }
    });
  }

  // 发送信息
  sendMessageOnce(sock: WebSocketClient, groupId: number, value: string): void {
    sock.send(this.createGroupMessage(groupId, value));
  }

  /**
   * 发送信息
   * @param { string } value: 要发送的信息
   * @param { number } groupId: 单个群的群号
   */
  sendMessage(value: string, groupId?: number): void {
    if (!this.websocket) return;

    try {
      const groupNumbers: Array<number> = this.groupNumbers;

      // 反向服务器发送数据
      if ('clients' in this.websocket) {
        this.websocket.clients.forEach((client: WebSocketClient) => {
          if (typeof groupId === 'number') {
            this.sendMessageOnce(client, groupId, value);
          } else {
            groupNumbers.forEach((groupNumber: number, index: number): void => {
              this.sendMessageOnce(client, groupNumber, value);
            });
          }
        });

        return;
      }

      if (typeof groupId === 'number') {
        // 只发送到一个群
        this.sendMessageOnce(this.websocket, groupId, value);
      } else {
        // 发送到多个群
        groupNumbers.forEach((groupNumber: number, index: number): void => {
          this.sendMessageOnce(this.websocket as WebSocketClient, groupNumber, value);
        });
      }
    } catch (err) {
      console.error(err);
    }
  }

  // 日志回调函数
  async logCommandCallback(groupId: number): Promise<void> {
    const { qqNumber }: OptionsItemValueV2 = this.config;
    const msg: string = LogCommandData(this.protocol, qqNumber, this.startTime);

    await this.sendMessage(msg, groupId);
  }

  // websocket初始化
  initWebSocket(): void {
    const { socketHost }: this = this;
    const { socketPort, reverseWebsocket, authKey }: OptionsItemValueV2 = this.config;

    if (reverseWebsocket) {
      this.websocket = new WebSocketServer({
        port: Number(socketPort)
      });

      if (authKey && !/^\s*$/.test(authKey)) {
        this.websocket.shouldHandle = (req: IncomingMessage): boolean => {
          return GoCQHttp.verifyAuthorization(req.headers.authorization, authKey);
        };
      }

      this.websocket.on('connection', (ws: WebSocketClient): void => {
        ws.on('message', this.handleMessageSocketMessage);
        ws.on('error', this.handleWebsocketError);
      });
      this.websocket.on('error', this.handleWebsocketError);
    } else {
      this.websocket = new WebSocketClient(`ws://${ socketHost }:${ socketPort }`, {
        headers: authKey && !/^\s*$/.test(authKey) ? {
          Authorization: `Bearer ${ authKey }`
        } : undefined
      });
      this.websocket.on('message', this.handleMessageSocketMessage);
      this.websocket.on('error', this.handleWebsocketError);
    }
  }

  // websocket销毁
  destroyWebsocket(): void {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = undefined;
    }
  }

  // 项目初始化
  async init(): Promise<boolean> {
    try {
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
  destroy(): boolean {
    try {
      this.destroyWebsocket();
      Basic.destroyExpand.call(this);

      return true;
    } catch (err) {
      console.error(err);

      return false;
    }
  }
}

export default GoCQHttp;