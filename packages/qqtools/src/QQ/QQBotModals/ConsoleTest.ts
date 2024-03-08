import * as dayjs from 'dayjs';
import { QQProtocol } from './ModalTypes';
import Basic, { type BasicArgs } from './Basic';
import { getGroupNumbers, getSocketHost, LogCommandData } from '../function/qq/qqUtils';
import type { OptionsItemValueV2, EditItem } from '../../commonTypes';

declare global {
  interface GlobalThis {
    __CONSOLE_TEST__: Record<string, Function>;
  }
}

globalThis.__CONSOLE_TEST__ = {};

const consoleTestEvent: Event = new Event('consoletest');

interface ConsoleTestEventData {
  qq: number;
  group: number;
  message: string;
}

/* 在浏览器上测试 */
class ConsoleTest extends Basic {
  public protocol: QQProtocol = QQProtocol.ConsoleTest;

  constructor(args: BasicArgs) {
    super(args);

    const { id, config, membersList }: BasicArgs = args;

    this.id = id;         // 当前登陆的唯一id
    this.config = config; // 配置
    this.membersList = membersList;
    this.groupNumbers = getGroupNumbers(this.config.groupNumber);
    this.socketHost = getSocketHost(config.socketHost);
  }

  // 接收信息
  handleConsoleTestListener: (event: Event) => Promise<void> = async (event: Event): Promise<void> => {
    const data: ConsoleTestEventData = event['data'];
    const { qqNumber, customCmd }: OptionsItemValueV2 = this.config;
    const groupNumbers: Array<number> = this.groupNumbers;

    if (qqNumber === data.qq && groupNumbers.includes(data.group)) {
      // 日志信息输出
      if (data.message === 'log') {
        this.logCommandCallback(data.group);

        return;
      }

      // 自定义信息处理
      if (customCmd?.length) {
        const index: number = customCmd.findIndex((o: EditItem): boolean => {
          if (o.isRegexp) {
            return new RegExp(o.cmd, 'i').test(data.message);
          } else {
            return o.cmd === data.message;
          }
        });

        if (index >= 0) {
          this.sendMessageText(customCmd[index].value, data.group);
        }
      }

      // mock
      if (process.env.NODE_ENV === 'development') {
        (await import('../function/mock/mock')).default(this, data.message, qqNumber, data.group);
      }
    }
  };

  // 日志回调函数
  logCommandCallback(groupId: number): void {
    const { qqNumber }: OptionsItemValueV2 = this.config;
    const msg: string = LogCommandData(this.protocol, qqNumber, this.startTime);

    this.sendMessageText(msg, groupId);
  }

  // 在console.log上输出信息
  consoleLogSend: Function = (value: string): void => {
    const groupNumbers: Array<number> = this.groupNumbers;
    const { qqNumber }: OptionsItemValueV2 = this.config;
    const t: string = dayjs().format('YYYY-MM-DD HH:mm:ss');

    groupNumbers.forEach((groupNumber: number, index: number): void => {
      console.log(`%c[${ t }] ${ qqNumber }：\n${ value }`, 'color: #1677ff;');
      consoleTestEvent['data'] = {
        qq: qqNumber,
        group: groupNumber,
        message: value
      };
      document.dispatchEvent(consoleTestEvent);
    });
  };

  // 发送信息
  sendMessageOnce(groupId: number, value: string): void {
    const t: string = dayjs().format('YYYY-MM-DD HH:mm:ss');

    console.log(`%c[${ t }] ${ groupId }：\n${ value }`, 'color: #237804;');
  }

  /**
   * 发送信息
   * @param { string } value - 要发送的信息
   * @param { number } [groupId] - 单个群的群号
   */
  sendMessage(value: string, groupId?: number): void {
    try {
      const groupNumbers: Array<number> = this.groupNumbers;

      if (typeof groupId === 'number') {
        // 只发送到一个群
        this.sendMessageOnce(groupId, value);
      } else {
        // 发送到多个群
        groupNumbers.forEach((groupNumber: number, index: number): void => {
          this.sendMessageOnce(groupNumber, value);
        });
      }
    } catch (err) {
      console.error(err);
    }
  }

  sendMessageText(value: string, groupId?: number): void {
    this.sendMessage(value, groupId);
  }

  // 项目初始化
  async init(): Promise<boolean> {
    try {
      document.addEventListener(consoleTestEvent.type, this.handleConsoleTestListener);
      globalThis.__CONSOLE_TEST__[`_${ this.config.qqNumber }`] = this.consoleLogSend;
      await Basic.initExpand.call(this);
      this.startTime = dayjs().format('YYYY-MM-DD HH:mm:ss');
      console.log(`%c[${ this.startTime }] Console test init. QQ: ${
        this.config.qqNumber
      }. Group: ${ this.groupNumbers.join(', ') }.`, 'color: #722ed1;');

      return true;
    } catch (err) {
      console.error(err);

      return false;
    }
  }

  // 项目销毁
  destroy(): boolean {
    try {
      document.removeEventListener(consoleTestEvent.type, this.handleConsoleTestListener);
      delete globalThis.__CONSOLE_TEST__[`_${ this.config.qqNumber }`];
      Basic.destroyExpand.call(this);
      console.log(`%c[${ this.startTime }] Console test destroy. QQ: ${
        this.config.qqNumber
      }. Group: ${ this.groupNumbers.join(', ') }.`, 'color: #722ed1;');

      return true;
    } catch (err) {
      console.error(err);

      return false;
    }
  }
}

export default ConsoleTest;