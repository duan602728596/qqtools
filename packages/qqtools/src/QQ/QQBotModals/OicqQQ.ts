import type { GroupMessage, MemberIncreaseEvent, Sendable } from 'icqq';
import * as dayjs from 'dayjs';
import { renderString } from 'nunjucks';
import { requestSendGroupMessage } from '@qqtools-api/oicq';
import Basic, { type BasicImplement, type MessageListener, type BasicArgs } from './Basic';
import { QQProtocol } from './ModalTypes';
import {
  getGroupNumbers,
  getSocketHost,
  LogCommandData,
  isGroupMessageEventData,
  isMemberIncreaseEventData
} from '../function/qq/qqUtils';
import { log } from '../function/expand/pocket48/pocket48V2Utils';
import parser, { type ParserResult } from '../function/parser/index';
import * as CQ from '../function/parser/CQ';
import type { OptionsItemValueV2, EditItem } from '../../commonTypes';

/* oicq的连接 */
class OicqQQ extends Basic implements BasicImplement<Sendable> {
  public protocol: QQProtocol = QQProtocol.Oicq;
  public oicqSocket?: WebSocket;

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
  handleMessageSocketMessage: MessageListener = async (event: MessageEvent): Promise<void> => {
    const { qqNumber, customCmd, groupWelcome, groupWelcomeSend }: OptionsItemValueV2 = this.config;
    const groupNumbers: Array<number> = this.groupNumbers;
    const data: GroupMessage | MemberIncreaseEvent = JSON.parse(event.data);

    if (isGroupMessageEventData(data) && data.sender.user_id !== qqNumber && groupNumbers.includes(data.group_id)) {
      const { raw_message: command, /* 当前命令 */ group_id: groupId /* 收到消息的群 */ }: GroupMessage = data;

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

  // websocket初始化
  initWebSocket(): void {
    const { socketHost }: this = this;
    const { socketPort }: OptionsItemValueV2 = this.config;

    this.oicqSocket = new WebSocket(`ws://${ socketHost }:${ socketPort }/oicq/ws`);
    this.oicqSocket.addEventListener('message', this.handleMessageSocketMessage, false);
  }

  // websocket销毁
  destroyWebsocket(): void {
    if (this.oicqSocket) {
      this.oicqSocket.removeEventListener('message', this.handleMessageSocketMessage);
      this.oicqSocket.close();
      this.oicqSocket = undefined;
    }
  }

  /**
   * 发送信息
   * @param { Sendable } value: 要发送的信息
   * @param { number } groupId: 单个群的群号
   */
  async sendMessage(value: Sendable, groupId?: number): Promise<void> {
    try {
      const { socketHost }: this = this;
      const { socketPort }: OptionsItemValueV2 = this.config;
      const groupNumbers: Array<number> = this.groupNumbers;
      const sendValue: ParserResult | Sendable = typeof value === 'string' ? parser({
        text: value,
        protocol: this.protocol
      }) : value;

      if (typeof groupId === 'number') {
        // 只发送到一个群
        await requestSendGroupMessage(groupId, socketHost, socketPort, sendValue);
      } else {
        // 发送到多个群
        await Promise.all(
          groupNumbers.map((item: number, index: number): Promise<unknown> => {
            return requestSendGroupMessage(item, socketHost, socketPort, sendValue);
          })
        );
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

export default OicqQQ;