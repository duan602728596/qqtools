import * as process from 'process';
import { CronJob } from 'cron';
import { message } from 'antd';
import { findIndex } from 'lodash-es';
import * as dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { renderString } from 'nunjucks';
import { Queue } from '@bbkkbkk/q';
import BilibiliWorker from 'worker-loader!./utils/bilibili.worker';
import TaobaWorker from 'worker-loader!./utils/taoba.worker';
import WeiboWorker from 'worker-loader!./utils/weibo.worker';
import {
  requestAuth,
  requestVerify,
  requestRelease,
  requestSendGroupMessage,
  requestManagers,
  requestWeiboInfo,
  requestRoomInfo
} from './services/services';
import { requestDetail, requestJoinRank } from './services/taoba';
import NimChatroomSocket, { ChatroomMember } from './NimChatroomSocket';
import { plain, atAll, miraiTemplate, getGroupNumbers, getSocketHost } from './utils/miraiUtils';
import { getRoomMessage, randomId, getLogMessage, log } from './utils/pocket48Utils';
import { timeDifference } from './utils/taobaUtils';
import type { OptionsItemValue, MemberInfo } from '../types';
import type {
  Plain,
  AuthResponse,
  MessageResponse,
  MessageChain,
  MessageSocketEventData,
  EventSocketEventData,
  NIMMessage,
  CustomMessageAll,
  WeiboTab,
  WeiboInfo,
  BilibiliRoomInfo,
  TaobaDetailDatasItem,
  TaobaDetail,
  TaobaIdolsJoinItem,
  TaobaRankItem,
  TaobaJoinRank
} from './qq.types';

const packageJson: any = require('../../package.json');

type MessageListener = (event: MessageEvent) => void | Promise<void>;
type CloseListener = (event: CloseEvent) => void | Promise<void>;

const nimChatroomSocketList: Array<NimChatroomSocket> = []; // 缓存连接
const queueMap: Map<number, Queue> = new Map(); // 发言队列，避免出现漏发的情况，每个qq限制一个发言队列

class QQ {
  public id: string;
  public config: OptionsItemValue;
  public groupNumbers: Array<number>; // 多个群
  public socketStatus: -1 | 0; // -1 关闭，0 正常
  public socketHost: string;
  public eventSocket?: WebSocket;
  public messageSocket?: WebSocket;
  public reconnectTimer: number | null; // 断线重连
  public session: string;
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

  public taobaWorker?: Worker;     // 桃叭监听
  public taobaInfo: { title: string; amount: number; expire: number };
  public otherTaobaIds?: Array<string>; // 其他的桃叭监听，pk时候用

  public cronJob?: CronJob;        // 定时任务

  constructor(id: string, config: OptionsItemValue, membersList?: Array<MemberInfo>) {
    this.id = id;         // 当前登陆的唯一id
    this.config = config; // 配置
    this.membersList = membersList;
    this.groupNumbers = getGroupNumbers(this.config.groupNumber);
    this.socketStatus = 0;
    this.socketHost = getSocketHost(config.socketHost);
  }

  // message事件监听
  handleMessageSocketMessage: MessageListener = async (event: MessageEvent): Promise<void> => {
    const { qqNumber, customCmd }: OptionsItemValue = this.config;
    const groupNumbers: Array<number> = this.groupNumbers;
    const data: MessageSocketEventData = JSON.parse(event.data);

    // 群信息
    if (data.type === 'GroupMessage' && data.sender.id !== qqNumber && groupNumbers.includes(data.sender.group.id)) {
      if (data.type === 'GroupMessage' && data.messageChain?.[1].type === 'Plain') {
        const command: string = data.messageChain[1].text; // 当前命令
        const groupId: number = data.sender.group.id;

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
            const value: Array<MessageChain> = miraiTemplate(customCmd[index].value);

            await this.sendMessageV2(value, groupId);
          }
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

        await this.sendMessageV2(value, data.member.group.id);
      }
    }
  };

  // socket关闭
  handleSocketClose: CloseListener = (event: CloseEvent): void => {
    if (this.socketStatus === -1) return;

    this.destroyWebsocket(); // 清除旧的socket
    this.reconnectTimer = window.setTimeout(this.reconnectLogin, 3_000);
  };

  // 断线重连
  reconnectLogin: Function = async (): Promise<void> => {
    try {
      const { socketHost }: this = this;
      const { socketPort, qqNumber }: OptionsItemValue = this.config;
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
    const { socketPort }: OptionsItemValue = this.config;

    this.messageSocket = new WebSocket(`ws://${ socketHost }:${ socketPort }/message?sessionKey=${ this.session }`);
    this.eventSocket = new WebSocket(`ws://${ socketHost }:${ socketPort }/event?sessionKey=${ this.session }`);
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
    const { qqNumber, socketPort, authKey }: OptionsItemValue = this.config;
    const authRes: AuthResponse = await requestAuth(socketHost, socketPort, authKey);

    if (authRes.code !== 0) {
      message.error('登陆失败：获取session失败。');

      return false;
    }

    this.session = authRes.session;

    const verifyRes: MessageResponse = await requestVerify(qqNumber, socketHost, socketPort, this.session);

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
  async sendMessage(value: Array<MessageChain>, groupId?: number): Promise<void> {
    const { socketHost }: this = this;
    const { socketPort }: OptionsItemValue = this.config;
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
  }

  /**
   * 添加到发送信息队列
   * @param { Array<MessageChain> } value: 要发送的信息
   * @param { number } groupId: 单个群的群号
   */
  sendMessageV2(value: Array<MessageChain>, groupId?: number): void {
    const { qqNumber }: OptionsItemValue = this.config;
    let queue: Queue | undefined;

    if (queueMap.has(qqNumber)) {
      queue = queueMap.get(qqNumber);
    } else {
      queue = new Queue({ workerLen: 1 }); // 发言队列，避免出现漏发的情况
      queueMap.set(qqNumber, queue);
    }

    queue.use([this.sendMessage, this, value, groupId]);
    queue.run();
    queue = undefined;
  }

  // 日志回调函数
  async logCommandCallback(groupId: number): Promise<void> {
    const versions: any = process.versions;
    const { qqNumber }: OptionsItemValue = this.config;
    const msg: string = `qqtools-mirai
软件版本：${ packageJson.version }
运行平台：${ process.platform }
Electron：${ versions.electron }
Chrome：${ versions.chrome }
Node：${ versions.node }
V8：${ versions.v8 }
机器人账号：${ qqNumber }
启动时间：${ this.startTime }`;

    await this.sendMessageV2([plain(msg)], groupId);
  }

  /* ==================== 业务相关 ==================== */

  // 事件监听
  async roomSocketMessage(event: Array<NIMMessage>): Promise<void> {
    const {
      pocket48LiveAtAll,
      pocket48ShieldMsgType,
      pocket48MemberInfo,
      pocket48LogSave,
      pocket48LogDir
    }: OptionsItemValue = this.config;
    const data: NIMMessage = event[0];                                 // 房间信息数组
    const customInfo: CustomMessageAll = JSON.parse(data.custom);      // 房间自定义信息
    const { sessionRole }: CustomMessageAll = customInfo; // 信息类型和sessionRole

    if (Number(sessionRole) === 0) return; // 过滤发言

    if (pocket48ShieldMsgType && pocket48ShieldMsgType.includes(customInfo.messageType)) {
      return; // 屏蔽信息类型
    }

    // 发送的数据
    const sendGroup: Array<MessageChain> = getRoomMessage({
      customInfo,
      data,
      pocket48LiveAtAll,
      event,
      pocket48ShieldMsgType,
      memberInfo: this.memberInfo,
      pocket48MemberInfo
    });

    if (sendGroup.length > 0) {
      await this.sendMessageV2(sendGroup);
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

  // 事件监听
  handleRoomSocketMessage: Function = (event: Array<NIMMessage>): void => {
    this.roomSocketMessage(event);
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

      this.sendMessageV2([plain(text)], groupId);
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

        await this.sendMessageV2([plain(logText)]);

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
      pocket48Account,
      pocket48RoomEntryListener
    }: OptionsItemValue = this.config;

    if (!(pocket48RoomListener && pocket48RoomId && pocket48Account)) return;

    // 判断socket列表内是否有当前房间的socket连接
    const index: number = findIndex(nimChatroomSocketList, { pocket48RoomId });

    this.nimChatroomSocketId = randomId();

    if (index < 0) {
      const nimChatroomSocket: NimChatroomSocket = new NimChatroomSocket({
        pocket48Account,
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

    if (pocket48RoomEntryListener && this.membersList?.length) {
      const idx: number = findIndex(this.membersList, (o: MemberInfo) => o.roomId === `${ pocket48RoomId }`);

      if (idx >= 0) {
        this.memberInfo = this.membersList[idx];
        this.handleRoomEntryTimer();
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
    await this.sendMessageV2(event.data.sendGroup);
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

    await this.sendMessageV2(sendMessage);
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

      await this.sendMessageV2([plain(msg)], groupId);
    }
  }

  // 桃叭排行榜的回调函数
  async taobaoCommandRankCallback(groupId: number): Promise<void> {
    const { taobaListen, taobaId }: OptionsItemValue = this.config;

    if (taobaListen && taobaId) {
      const res: TaobaJoinRank = await requestJoinRank(taobaId);
      const list: Array<Plain> = res.list.map((item: TaobaRankItem, index: number): Plain => {
        return plain(`\n${ index + 1 }、${ item.nick }：${ item.money }`);
      });
      const msg: string = `${ this.taobaInfo.title } 排行榜
集资参与人数：${ res.juser }人`;

      await this.sendMessageV2([plain(msg)].concat(list), groupId);
    }
  }

  /* 桃叭监听 TODO: 由于桃叭关闭了订单接口，暂时移除集资监听功能
  handleTaobaWorkerMessage: MessageListener = async (event: MessageEvent): Promise<void> => {
    const { taobaId, taobaTemplate, taobaRankList: isTaobaRankList }: OptionsItemValue = this.config;
    const result: Array<TaobaIdolsJoinItem> = event.data.result;
    const otherTaobaDetails: Array<TaobaDetailDatasItem> | undefined = event.data.otherTaobaDetails;
    const taobaRankList: Array<TaobaIdolsJoinItem> | undefined = event.data.taobaRankList;
    const [res0, res1]: [TaobaDetail, TaobaJoinRank] = await Promise.all([
      requestDetail(taobaId!),
      requestJoinRank(taobaId!)
    ]);

    // 发送消息
    const endTime: Dayjs = dayjs.unix(res0.datas.expire);
    const { amount, donation }: {
      amount: number;
      donation: number;
    } = res0.datas;

    for (let i: number = result.length - 1; i >= 0; i--) {
      const item: TaobaIdolsJoinItem = result[i];

      // 计算排行榜
      let rankIndex: number | undefined = undefined;

      if (isTaobaRankList && taobaRankList?.length) {
        rankIndex = findIndex(taobaRankList, (o: TaobaIdolsJoinItem): boolean => Number(o.userid) === item.userid);
      }

      const msg: string = renderString(taobaTemplate, {
        nickname: item.nick,
        title: this.taobaInfo.title,
        money: item.money,
        taobaid: taobaId,
        donation,
        amount,
        amountdifference: amount - donation,
        juser: res1.juser,
        expire: endTime.format('YYYY-MM-DD HH:mm:ss'),
        timedifference: timeDifference(endTime.valueOf()),
        otherTaobaDetails,
        rankIndex,
        taobaRankList
      });

      await this.sendMessageV2(miraiTemplate(msg));
    }
  };
  */

  // 桃叭初始化
  async initTaobaWorker(): Promise<void> {
    const { taobaListen, taobaId, otherTaobaIds, taobaRankList }: OptionsItemValue = this.config;

    if (taobaListen && taobaId) {
      const res: TaobaDetail = await requestDetail(taobaId);

      // if (otherTaobaIds && !/^\s*$/.test(otherTaobaIds)) {
      //   this.otherTaobaIds = otherTaobaIds.split(/\s*[,，、。.]\s*/g);
      // }

      this.taobaInfo = {
        title: res.datas.title,   // 项目名称
        amount: res.datas.amount, // 集资总金额
        expire: res.datas.expire  // 项目结束时间（时间戳，秒）
      };

      /*
      TODO: 由于桃叭关闭了订单接口，暂时移除集资监听功能
      this.taobaWorker = new TaobaWorker();
      this.taobaWorker.addEventListener('message', this.handleTaobaWorkerMessage, false);
      this.taobaWorker.postMessage({
        taobaId,
        taobaInfo: this.taobaInfo,
        otherTaobaIds: this.otherTaobaIds,
        taobaRankList
      });
      */
    }
  }

  // 定时任务初始化
  initCronJob(): void {
    const { cronJob, cronTime, cronSendData }: OptionsItemValue = this.config;

    if (cronJob && cronTime && cronSendData) {
      this.cronJob = new CronJob(cronTime, (): void => {
        this.sendMessageV2(miraiTemplate(cronSendData));
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
      await this.initPocket48();
      await this.initWeiboWorker();
      await this.initBilibiliWorker();
      await this.initTaobaWorker();
      this.initCronJob();
      this.startTime = dayjs().format('YYYY-MM-DD HH:mm:ss');

      return true;
    } catch (err) {
      console.error(err);

      return false;
    }
  }

  // 项目销毁
  async destroy(loginList?: Array<QQ>): Promise<boolean> {
    const { socketHost }: this = this;
    const { qqNumber, socketPort }: OptionsItemValue = this.config;

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

      // 销毁桃叭监听
      if (this.taobaWorker) {
        this.taobaWorker.terminate();
        this.taobaWorker = undefined;
      }

      // 销毁定时任务
      if (this.cronJob) {
        this.cronJob.stop();
        this.cronJob = undefined;
      }

      /**
       * 销毁队列
       * 过滤自己后，当登陆列表内不存在当前的qq时，要销毁掉队列
       */
      if (loginList?.length) {
        const filterList: Array<QQ> = loginList.filter((o: QQ): boolean => (
          o.id !== this.id && o.config.qqNumber === this.config.qqNumber));

        if (filterList.length === 0) {
          queueMap.delete(this.config.qqNumber);
        }
      }

      return true;
    } catch (err) {
      console.error(err);

      return false;
    }
  }
}

export default QQ;