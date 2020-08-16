import { CronJob } from 'cron';
import { message } from 'antd';
import NIM_SDK from 'SDK';
import { findIndex } from 'lodash';
import BilibiliWorker from 'worker-loader!./utils/bilibili.worker';
import WeiboWorker from 'worker-loader!./utils/weibo.worker';
import {
  requestAuth,
  requestVerify,
  requestRelease,
  requestSendGroupMessage,
  requestWeiboInfo,
  requestRoomInfo
} from './services/services';
import el from './sdk/eval';
import { plain, atAll, miraiTemplate } from './utils/miraiUtils';
import { getRoomMessage } from './utils/pocket48Utils';
import type { OptionsItemValue } from '../../types';
import type {
  AuthResponse,
  MessageResponse,
  MessageChain,
  MessageSocketEventData,
  EventSocketEventData,
  NIMError,
  NIMMessage,
  CustomMessageAll,
  WeiboTab,
  WeiboInfo,
  BilibiliRoomInfo
} from './qq.types';

type MessageListener = (event: MessageEvent) => void | Promise<void>;

const { Chatroom }: any = NIM_SDK;

/* 将群号字符串解析成数组 */
export function getGroupNumbers(groupNumber: string): Array<number> {
  return `${ groupNumber }`.split(/\s*[,，]\s*/)
    .filter((o: string) => o !== '')
    .map(Number);
}

class QQ {
  public id: string;
  public config: OptionsItemValue;
  public groupNumbers: Array<number>; // 多个群
  public eventSocket: WebSocket;
  public messageSocket: WebSocket;
  public session: string;

  public nimChatroomSocket: any;   // 口袋48

  public weiboLfid: string;        // 微博的lfid
  public weiboWorker?: Worker;     // 微博监听

  public bilibiliWorker?: Worker;  // b站直播监听
  public bilibiliUsername: string; // 用户名

  public cronJob?: CronJob;        // 定时任务

  constructor(id: string, config: OptionsItemValue) {
    this.id = id;         // 当前登陆的唯一id
    this.config = config; // 配置
    this.groupNumbers = getGroupNumbers(this.config.groupNumber);
  }

  // message事件监听
  handleMessageSocketMessage: MessageListener = async (event: MessageEvent): Promise<void> => {
    const { qqNumber, customCmd }: OptionsItemValue = this.config;
    const groupNumbers: Array<number> = this.groupNumbers;
    const data: MessageSocketEventData = JSON.parse(event.data);

    // 群信息
    if (data.type === 'GroupMessage' && data.sender.id !== qqNumber && groupNumbers.includes(data.sender.group.id)) {
      // 自定义信息处理
      if (data.type === 'GroupMessage' && data.messageChain?.[1].type === 'Plain' && customCmd?.length) {
        const index: number = findIndex(customCmd, { cmd: data.messageChain[1].text });

        if (index >= 0) {
          const value: Array<MessageChain> = miraiTemplate(customCmd[index].value);

          await this.sengMessage(value, data.sender.group.id);
        }
      }
    }
  }

  // socket事件监听
  handleEventSocketMessage: MessageListener = async (event: MessageEvent): Promise<void> => {
    const { qqNumber, groupWelcome, groupWelcomeSend }: OptionsItemValue = this.config;
    const groupNumbers: Array<number> = this.groupNumbers;
    const data: EventSocketEventData = JSON.parse(event.data);

    // 欢迎进群
    if (data.type === 'MemberJoinEvent' && data.member.id !== qqNumber && groupNumbers.includes(data.member.group.id)) {
      if (groupWelcome && groupWelcomeSend) {
        const value: Array<MessageChain> = miraiTemplate(groupWelcomeSend, {
          qqNumber: data.member.id
        });

        await this.sengMessage(value, data.member.group.id);
      }
    }
  };

  // websocket初始化
  initWebSocket(): void {
    const { socketPort }: OptionsItemValue = this.config;

    this.messageSocket = new WebSocket(`ws://localhost:${ socketPort }/message?sessionKey=${ this.session }`);
    this.eventSocket = new WebSocket(`ws://localhost:${ socketPort }/event?sessionKey=${ this.session }`);

    this.messageSocket.addEventListener('message', this.handleMessageSocketMessage, false);
    this.eventSocket.addEventListener('message', this.handleEventSocketMessage, false);
  }

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

  /**
   * 发送信息
   * @param { Array<MessageChain> } value: 要发送的信息
   * @param { number } groupId: 单个群的群号
   */
  async sengMessage(value: Array<MessageChain>, groupId?: number): Promise<void> {
    const { socketPort }: OptionsItemValue = this.config;
    const groupNumbers: Array<number> = this.groupNumbers;

    if (typeof groupId === 'number') {
      // 只发送到一个群
      await requestSendGroupMessage(groupId, socketPort, this.session, value);
    } else {
      // 发送到多个群
      await Promise.all(
        groupNumbers.map((item: number, index: number): Promise<MessageResponse> => {
          return requestSendGroupMessage(item, socketPort, this.session, value);
        })
      );
    }
  }

  /* ==================== 业务相关 ==================== */

  // 进入房间
  handleRoomSocketConnect: Function = (event: any): void => {
    console.log('进入聊天室', event);
    message.success('进入口袋48房间');
  };

  // 进入房间失败
  handleRoomSocketError: Function = (err: NIMError, event: any): void => {
    console.log('发生错误', err, event);
    message.error('进入口袋48房间失败');
  };

  // 断开连接
  handleRoomSocketDisconnect: Function = (err: NIMError): void => {
    console.log('连接断开', err);

    if (err.code === 'logout') {
      message.warn('断开连接');
    } else {
      message.error(`【${ err.code }】${ err.message }`);
    }
  };

  // 事件监听
  async roomSocketMessage(event: Array<NIMMessage>): Promise<void> {
    const { pocket48LiveAtAll, pocket48ShieldMsgType }: OptionsItemValue = this.config;
    const data: NIMMessage = event[0];                                 // 房间信息数组
    const customInfo: CustomMessageAll = JSON.parse(data.custom);      // 房间自定义信息
    const { sessionRole }: CustomMessageAll = customInfo; // 信息类型和sessionRole

    if (Number(sessionRole) === 0) return; // 过滤发言

    if (pocket48ShieldMsgType && pocket48ShieldMsgType.includes(customInfo.messageType)) return; // 屏蔽信息类型

    // 发送的数据
    const sendGroup: Array<MessageChain> = getRoomMessage({
      customInfo,
      data,
      pocket48LiveAtAll,
      event
    });

    if (sendGroup.length > 0) {
      await this.sengMessage(sendGroup);
    }
  }

  // 事件监听
  handleRoomSocketMessage: Function = (event: Array<NIMMessage>): void => {
    this.roomSocketMessage(event);
  };

  // 口袋48监听初始化
  initPocket48(): void {
    const { pocket48RoomListener, pocket48RoomId, pocket48Account }: OptionsItemValue = this.config;

    if (!(pocket48RoomListener && pocket48RoomId && pocket48Account)) return;

    this.nimChatroomSocket = Chatroom.getInstance({
      appKey: el,
      account: pocket48Account,
      token: pocket48Account,
      chatroomId: pocket48RoomId,
      chatroomAddresses: ['chatweblink01.netease.im:443'],
      onconnect: this.handleRoomSocketConnect,
      onmsgs: this.handleRoomSocketMessage,
      onerror: this.handleRoomSocketError,
      ondisconnect: this.handleRoomSocketDisconnect
    });
  }

  // 微博监听
  handleWeiboWorkerMessage: MessageListener = async (event: MessageEvent): Promise<void> => {
    await this.sengMessage(event.data.sendGroup);
  };

  // 微博初始化
  async initWeiboWorker(): Promise<void> {
    const { weiboListener, weiboUid, weiboAtAll }: OptionsItemValue = this.config;

    if (!(weiboListener && weiboUid)) return;

    const resWeiboInfo: WeiboInfo = await requestWeiboInfo(weiboUid);
    const weiboTab: Array<WeiboTab> = resWeiboInfo.data.tabsInfo.tabs
      .filter((o: WeiboTab): boolean => o.tabKey === 'weibo');

    if (weiboTab.length > 0) {
      this.weiboLfid = weiboTab[0].containerid;
      this.weiboWorker = new WeiboWorker();
      this.weiboWorker.addEventListener('message', this.handleWeiboWorkerMessage, false);
      this.weiboWorker.postMessage({
        lfid: this.weiboLfid,
        weiboAtAll
      });
    }
  }

  // bilibili message监听事件
  handleBilibiliWorkerMessage: MessageListener = async (event: MessageEvent): Promise<void> => {
    const { bilibiliAtAll }: OptionsItemValue = this.config;
    const text: string = `bilibili：${ this.bilibiliUsername }在B站开启了直播。`;
    const sendMessage: Array<MessageChain> = [plain(text)];

    if (bilibiliAtAll) {
      sendMessage.unshift(atAll());
    }

    await this.sengMessage(sendMessage);
  };

  // bilibili直播监听初始化
  async initBilibiliWorker(): Promise<void> {
    const { bilibiliLive, bilibiliLiveId }: OptionsItemValue = this.config;

    if (bilibiliLive && bilibiliLiveId) {
      const res: BilibiliRoomInfo = await requestRoomInfo(bilibiliLiveId);

      this.bilibiliUsername = res.data.anchor_info.base_info.uname;
      this.bilibiliWorker = new BilibiliWorker();
      this.bilibiliWorker.addEventListener('message', this.handleBilibiliWorkerMessage, false);
      this.bilibiliWorker.postMessage({ id: bilibiliLiveId });
    }
  }

  // 定时任务初始化
  initCronJob(): void {
    const { cronJob, cronTime, cronSendData }: OptionsItemValue = this.config;

    if (cronJob && cronTime && cronSendData) {
      this.cronJob = new CronJob(cronTime, (): void => {
        this.sengMessage(miraiTemplate(cronSendData));
      });
      this.cronJob.start();
    }
  }

  // 项目初始化
  async init(): Promise<boolean> {
    try {
      const result: boolean = await this.getSession();

      if (!result) throw new Error('登陆失败！');

      this.initWebSocket();
      this.initPocket48();
      await this.initWeiboWorker();
      await this.initBilibiliWorker();
      this.initCronJob();

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

      // 销毁socket监听
      this.eventSocket.removeEventListener('message', this.handleEventSocketMessage);
      this.messageSocket.removeEventListener('message', this.handleMessageSocketMessage);
      this.eventSocket.close();
      this.messageSocket.close();

      // 销毁口袋监听
      if (this.nimChatroomSocket) {
        this.nimChatroomSocket.disconnect();
        this.nimChatroomSocket = undefined;
      }

      // 销毁微博监听
      if (this.weiboWorker) {
        this.weiboWorker.terminate();
        this.weiboWorker = undefined;
      }

      // 销毁bilibili监听
      if (this.bilibiliWorker) {
        this.bilibiliWorker.terminate();
        this.bilibiliWorker = undefined;
      }

      // 销毁定时任务
      if (this.cronJob) {
        this.cronJob.stop();
        this.cronJob = undefined;
      }

      return true;
    } catch (err) {
      console.error(err);

      return false;
    }
  }
}

export default QQ;