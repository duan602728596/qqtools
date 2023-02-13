import type { IncomingMessage } from 'node:http';
import { WebSocket as WebSocketClient, WebSocketServer } from 'ws';
import type { GroupMessageEventData, MemberIncreaseEventData } from 'oicq';
import * as dayjs from 'dayjs';
import { renderString } from 'nunjucks';
import { message } from 'antd';
import Basic from './Basic';
import { getGroupNumbers, getSocketHost, LogCommandData } from '../utils/miraiUtils';
import { isGroupMessageEventData, isMemberIncreaseEventData } from '../utils/oicqUtils';
import type { MemberInfo, OptionsItemValueV2, EditItem } from '../../commonTypes';

/* go-cqhttp */
class GoCQHttp extends Basic {
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

  public protocol: 'go-cqhttp' = 'go-cqhttp';
  public websocket: WebSocketClient | WebSocketServer | undefined;

  constructor(id: string, config: OptionsItemValueV2, membersList?: Array<MemberInfo>) {
    super();

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
    const data: GroupMessageEventData | MemberIncreaseEventData | {
      post_type: 'meta_event';
      meta_event_type: 'heartbeat';
    } = JSON.parse(buffer.toString());

    if (data.post_type === 'meta_event' && data.meta_event_type === 'heartbeat') return;

    if (isGroupMessageEventData(data) && data.sender.user_id !== qqNumber && groupNumbers.includes(data.group_id)) {
      const { raw_message: command, /* 当前命令 */ group_id: groupId /* 收到消息的群 */ }: GroupMessageEventData = data;

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
    }

    if (isMemberIncreaseEventData(data) && data.user_id !== qqNumber && groupNumbers.includes(data.group_id)) {
      if (groupWelcome && groupWelcomeSend) {
        const msg: string = renderString(groupWelcomeSend, {
          at: `[CQ:at,qq=${ data.user_id }]`
        });

        await this.sendMessage(msg, data.group_id);
      }
    }
  };

  // 错误消息
  handleWebsocketError(err: Error): void {
    message.error(err.toString());
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
    const msg: string = LogCommandData('go-cqhttp', qqNumber, this.startTime);

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