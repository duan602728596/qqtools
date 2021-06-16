import { randomUUID } from 'crypto';
import * as oicq from 'oicq';
import type { EventData, GroupMessageEventData, RetCommon, MessageElem, TextElem } from 'oicq';
import { CronJob } from 'cron';
import { findIndex } from 'lodash-es';
import * as dayjs from 'dayjs';
import { renderString } from 'nunjucks';
import BilibiliWorker from 'worker-loader!./utils/bilibili.worker';
import WeiboWorker from 'worker-loader!./utils/weibo.worker';
import NimChatroomSocket, { ChatroomMember } from './NimChatroomSocket';
import { getGroupNumbers, getSocketHost, LogCommandData } from './utils/miraiUtils';
import { isGroupMessageEventData, isMemberIncreaseEventData } from './utils/oicqUtils';
import { getRoomMessageForOicq, getLogMessage, log, RoomMessageArgs } from './utils/pocket48Utils';
import { requestRoomInfo, requestWeiboInfo } from './services/services';
import { requestSendGroupMessage } from './services/oicq';
import { requestDetail, requestJoinRank } from './services/taoba';
import type { OptionsItemValue, MemberInfo } from '../types';
import type {
  NIMMessage,
  CustomMessageAll,
  WeiboTab,
  WeiboInfo,
  BilibiliRoomInfo,
  TaobaDetail,
  TaobaRankItem,
  TaobaJoinRank
} from './qq.types';

type MessageListener = (event: MessageEvent) => void | Promise<void>;

const nimChatroomSocketList: Array<NimChatroomSocket> = []; // 缓存连接

/* oicq的连接 */
class OicqQQ {
  public protocol: string = 'oicq';
  public id: string;
  public config: OptionsItemValue;
  public groupNumbers: Array<number>; // 多个群
  public socketHost: string;
  public oicqSocket?: WebSocket;
  public startTime: string; // 启动时间

  public nimChatroomSocketId?: string;     // socketId
  public nimChatroom?: NimChatroomSocket;  // socket
  public memberInfo?: MemberInfo;          // 房间成员信息
  public membersList?: Array<MemberInfo>;  // 所有成员信息
  public membersCache?: Array<MemberInfo>; // 缓存
  public roomEntryListener: number | null = null; // 监听器

  public weiboLfid: string;        // 微博的lfid
  public weiboWorker?: Worker;     // 微博监听

  public bilibiliWorker?: Worker;  // b站直播监听
  public bilibiliUsername: string; // 用户名

  public taobaInfo: { title: string; amount: number; expire: number }; // 桃叭信息

  public cronJob?: CronJob;        // 定时任务

  constructor(id: string, config: OptionsItemValue, membersList?: Array<MemberInfo>) {
    this.id = id;         // 当前登陆的唯一id
    this.config = config; // 配置
    this.membersList = membersList;
    this.groupNumbers = getGroupNumbers(this.config.groupNumber);
    this.socketHost = getSocketHost(config.socketHost);
  }

  // message事件监听
  handleMessageSocketMessage: MessageListener = async (event: MessageEvent): Promise<void> => {
    const { qqNumber, customCmd, groupWelcome, groupWelcomeSend }: OptionsItemValue = this.config;
    const groupNumbers: Array<number> = this.groupNumbers;
    const data: EventData = JSON.parse(event.data);

    if (isGroupMessageEventData(data) && data.sender.user_id !== qqNumber && groupNumbers.includes(data.group_id)) {
      const { raw_message: command, /* 当前命令 */ group_id: groupId /* 收到消息的群 */ }: GroupMessageEventData = data;

      // 日志信息输出
      if (command === 'log') {
        this.logCommandCallback(groupId);

        return;
      }

      if (command === 'pocketroom') {
        this.xoxInRoom(groupId);

        return;
      }

      // 集资命令处理
      if (['taoba', '桃叭', 'jizi', 'jz', '集资'].includes(command)) {
        this.taobaoCommandCallback(groupId);

        return;
      }

      // 排行榜命令处理
      if (['排行榜', 'phb'].includes(command)) {
        this.taobaoCommandRankCallback(groupId);

        return;
      }

      // 自定义信息处理
      if (customCmd?.length) {
        const index: number = findIndex(customCmd, { cmd: command });

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

  // websocket初始化
  initWebSocket(): void {
    const { socketHost }: this = this;
    const { socketPort }: OptionsItemValue = this.config;

    this.oicqSocket = new WebSocket(`ws://${ socketHost }:${ socketPort }/oicq/ws`);
    this.oicqSocket.addEventListener('message', this.handleMessageSocketMessage, false);
  }

  // websocket销毁
  destroyWebsocket(): void {
    if (this.oicqSocket) {
      this.oicqSocket.removeEventListener('message', this.handleMessageSocketMessage);
      this.oicqSocket = undefined;
    }
  }

  /**
   * 发送信息
   * @param { MessageElem | Iterable<MessageElem> | string } value: 要发送的信息
   * @param { number } groupId: 单个群的群号
   */
  async sendMessage(value: MessageElem | Iterable<MessageElem> | string, groupId?: number): Promise<void> {
    try {
      const { socketHost }: this = this;
      const { socketPort }: OptionsItemValue = this.config;
      const groupNumbers: Array<number> = this.groupNumbers;

      if (typeof groupId === 'number') {
        // 只发送到一个群
        await requestSendGroupMessage(groupId, socketHost, socketPort, value);
      } else {
        // 发送到多个群
        await Promise.all(
          groupNumbers.map((item: number, index: number): Promise<RetCommon> => {
            return requestSendGroupMessage(item, socketHost, socketPort, value);
          })
        );
      }
    } catch (err) {
      console.error(err);
    }
  }

  // 日志回调函数
  async logCommandCallback(groupId: number): Promise<void> {
    const { qqNumber }: OptionsItemValue = this.config;
    const msg: string = LogCommandData('oicq', qqNumber, this.startTime);

    await this.sendMessage(msg, groupId);
  }

  // 处理单个消息
  async roomSocketMessage(event: Array<NIMMessage>): Promise<void> {
    const {
      pocket48LiveAtAll,
      pocket48ShieldMsgType,
      pocket48MemberInfo,
      pocket48LogSave,
      pocket48LogDir
    }: OptionsItemValue = this.config;
    const data: NIMMessage = event[0];                            // 房间信息数组
    const customInfo: CustomMessageAll = JSON.parse(data.custom); // 房间自定义信息
    const { sessionRole }: CustomMessageAll = customInfo;         // 信息类型和sessionRole

    if (Number(sessionRole) === 0 && customInfo.messageType !== 'PRESENT_TEXT') return; // 过滤发言

    if (pocket48ShieldMsgType && pocket48ShieldMsgType.includes(customInfo.messageType)) {
      return; // 屏蔽信息类型
    }

    // 发送的数据
    const roomMessageArgs: RoomMessageArgs = {
      customInfo,
      data,
      pocket48LiveAtAll,
      event,
      pocket48ShieldMsgType,
      memberInfo: this.memberInfo,
      pocket48MemberInfo
    };
    const sendGroup: Array<MessageElem> = getRoomMessageForOicq(roomMessageArgs);

    if (sendGroup.length > 0) {
      await this.sendMessage(sendGroup);
    }

    // 日志
    if (pocket48LogSave && pocket48LogDir && !/^\s*$/.test(pocket48LogDir)) {
      const logData: string | undefined = getLogMessage({
        customInfo,
        data,
        event,
        memberInfo: this.memberInfo
      });

      if (logData) {
        await log(pocket48LogDir, logData);
      }
    }
  }

  // 循环处理所有消息
  async roomSocketMessageAll(event: Array<NIMMessage>): Promise<void> {
    for (const item of event) {
      try {
        await this.roomSocketMessage([item]);
      } catch (err) {
        console.error(err);
      }
    }
  }

  // 事件监听
  handleRoomSocketMessage: Function = (event: Array<NIMMessage>): void => {
    this.roomSocketMessageAll(event);
  };

  // 输出当前房间的游客信息
  xoxInRoom(groupId: number): void {
    const { pocket48RoomEntryListener }: OptionsItemValue = this.config;

    if (pocket48RoomEntryListener && this.membersList?.length && this.memberInfo) {
      const members: Array<MemberInfo> = this.membersCache ?? [];
      const nowMembers: string[] = []; // 本次房间内小偶像的数组
      const name: string = this.memberInfo?.ownerName!;

      for (const member of members) {
        nowMembers.push(member.ownerName);
      }

      let text: string = `${ dayjs().format('YYYY-MM-DD HH:mm:ss') }在 ${ name } 的房间：\n`;

      if (nowMembers?.length) {
        text += `${ nowMembers.join('\n') }`;
      } else {
        text += '暂无成员';
      }

      this.sendMessage(text, groupId);
    }
  }

  // 获取房间信息
  handleRoomEntryTimer: Function = async (): Promise<void> => {
    try {
      const members: Array<ChatroomMember> = await this.nimChatroom!.getChatroomMembers();
      const entryLog: string[] = [], // 进入房间的log日志的数组
        outputLog: string[] = [];    // 退出房间的log日志的数组
      const nowMembers: Array<MemberInfo> = []; // 本次房间内小偶像的数组
      const name: string = this.memberInfo?.ownerName!;
      const { pocket48LogSave, pocket48LogDir }: OptionsItemValue = this.config;

      // 获取进入房间的信息
      for (const member of members) {
        // 判断是否是小偶像
        const idx: number = findIndex(this.membersList, (o: MemberInfo): boolean => o.account === member.account);

        if (idx < 0) {
          continue;
        }

        const xoxMember: MemberInfo = this.membersList![idx];

        nowMembers.push(xoxMember); // 当前房间的小偶像

        // 没有缓存时不做判断
        if (!this.membersCache) {
          console.log(`${ xoxMember.ownerName } 在 ${ name } 的房间内`);
          continue;
        }

        // 判断是否进入过房间（存在于缓存中）
        const idx1: number = findIndex(this.membersCache, (o: MemberInfo): boolean => o.account === xoxMember.account);

        if (idx1 < 0) {
          entryLog.push(`${ xoxMember.ownerName } 进入了 ${ name } 的房间`);
        }
      }

      // 离开房间的信息（缓存内的信息不在新信息中）
      if (this.membersCache) {
        for (const member of this.membersCache) {
          const idx: number = findIndex(nowMembers, (o: MemberInfo): boolean => o.account === member.account);

          if (idx < 0) {
            outputLog.push(`${ member.ownerName } 离开了 ${ name } 的房间`);
          }
        }
      }

      this.membersCache = nowMembers; // 保存当前房间的xox信息

      const allLogs: Array<string> = entryLog.concat(outputLog);

      if (allLogs?.length) {
        const logText: string = `${ dayjs().format('YYYY-MM-DD HH:mm:ss') }\n${ allLogs.join('\n') }`;

        await this.sendMessage(logText);

        // 日志
        if (pocket48LogSave && pocket48LogDir && !/^\s*$/.test(pocket48LogDir)) {
          await log(pocket48LogDir, logText);
        }
      }
    } catch (err) {
      console.error(err);
    }

    this.roomEntryListener = setTimeout(this.handleRoomEntryTimer, 20_000);
  };

  // 口袋48监听初始化
  async initPocket48(): Promise<void> {
    const {
      pocket48RoomListener,
      pocket48RoomId,
      pocket48IsAnonymous,
      pocket48Account,
      pocket48Token,
      pocket48RoomEntryListener,
      pocket48MemberInfo
    }: OptionsItemValue = this.config;

    if (!pocket48RoomListener) return;

    if (!(pocket48IsAnonymous || (pocket48RoomId && pocket48Account && pocket48Token))) return;

    // 判断socket列表内是否有当前房间的socket连接
    const index: number = findIndex(nimChatroomSocketList, { pocket48RoomId });

    this.nimChatroomSocketId = randomUUID();

    if (index < 0) {
      const nimChatroomSocket: NimChatroomSocket = new NimChatroomSocket({
        pocket48IsAnonymous,
        pocket48Account,
        pocket48Token,
        pocket48RoomId
      });

      await nimChatroomSocket.init();
      nimChatroomSocket.addQueue({
        id: this.nimChatroomSocketId,
        onmsgs: this.handleRoomSocketMessage
      });
      nimChatroomSocketList.push(nimChatroomSocket); // 添加到列表
      this.nimChatroom = nimChatroomSocket;
    } else {
      nimChatroomSocketList[index].addQueue({
        id: this.nimChatroomSocketId,
        onmsgs: this.handleRoomSocketMessage
      });
      this.nimChatroom = nimChatroomSocketList[index];
    }

    if ((pocket48RoomEntryListener || pocket48MemberInfo) && this.membersList?.length) {
      const idx: number = findIndex(this.membersList, (o: MemberInfo) => o.roomId === `${ pocket48RoomId }`);

      if (idx >= 0) {
        this.memberInfo = this.membersList[idx];
        pocket48RoomEntryListener && this.handleRoomEntryTimer();
      }
    }
  }

  // 移除socket连接
  disconnectPocket48(): void {
    const { pocket48RoomId }: OptionsItemValue = this.config;
    const index: number = findIndex(nimChatroomSocketList, { pocket48RoomId });

    if (this.roomEntryListener !== null) {
      clearTimeout(this.roomEntryListener);
    }

    if (index >= 0 && this.nimChatroomSocketId) {
      nimChatroomSocketList[index].removeQueue(this.nimChatroomSocketId);

      if (nimChatroomSocketList[index].queues.length === 0) {
        nimChatroomSocketList[index].disconnect();
        nimChatroomSocketList.splice(index, 1);
      }
    }

    this.nimChatroomSocketId = undefined;
  }

  // 微博监听
  handleWeiboWorkerMessage: MessageListener = async (event: MessageEvent): Promise<void> => {
    await this.sendMessage(event.data.sendGroup);
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
    const sendMessage: string = `${ bilibiliAtAll ? '[CQ:at,qq=all]' : '' }${ text }`;

    await this.sendMessage(sendMessage);
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

  // 桃叭命令的回调函数
  async taobaoCommandCallback(groupId: number): Promise<void> {
    const { taobaListen, taobaId, taobaCommandTemplate }: OptionsItemValue = this.config;

    if (taobaListen && taobaId) {
      const msg: string = renderString(taobaCommandTemplate, {
        title: this.taobaInfo.title,
        taobaid: taobaId
      });

      await this.sendMessage(msg, groupId);
    }
  }

  // 桃叭排行榜的回调函数
  async taobaoCommandRankCallback(groupId: number): Promise<void> {
    const { taobaListen, taobaId }: OptionsItemValue = this.config;

    if (taobaListen && taobaId) {
      const res: TaobaJoinRank = await requestJoinRank(taobaId);
      const list: Array<TextElem> = res.list.map((item: TaobaRankItem, index: number): TextElem => {
        return oicq.segment.text(`\n${ index + 1 }、${ item.nick }：${ item.money }`);
      });
      const msg: string = `${ this.taobaInfo.title } 排行榜
集资参与人数：${ res.juser }人`;

      await this.sendMessage([oicq.segment.text(msg)].concat(list), groupId);
    }
  }

  // 桃叭初始化
  async initTaoba(): Promise<void> {
    const { taobaListen, taobaId }: OptionsItemValue = this.config;

    if (taobaListen && taobaId) {
      const res: TaobaDetail = await requestDetail(taobaId);

      this.taobaInfo = {
        title: res.datas.title,   // 项目名称
        amount: res.datas.amount, // 集资总金额
        expire: res.datas.expire  // 项目结束时间（时间戳，秒）
      };
    }
  }

  // 定时任务初始化
  initCronJob(): void {
    const { cronJob, cronTime, cronSendData }: OptionsItemValue = this.config;

    if (cronJob && cronTime && cronSendData) {
      this.cronJob = new CronJob(cronTime, (): void => {
        this.sendMessage(cronSendData);
      });
      this.cronJob.start();
    }
  }

  // 项目初始化
  async init(): Promise<boolean> {
    try {
      this.initWebSocket();
      await this.initPocket48();
      await this.initWeiboWorker();
      await this.initBilibiliWorker();
      await this.initTaoba();
      this.initCronJob();
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

      // 销毁口袋监听
      if (this.nimChatroomSocketId) {
        this.disconnectPocket48();
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

export default OicqQQ;