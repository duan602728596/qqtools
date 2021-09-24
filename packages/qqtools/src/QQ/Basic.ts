import { randomUUID } from 'node:crypto';
import type { CronJob } from 'cron';
import { message } from 'antd';
import BilibiliWorker from 'worker-loader!./utils/bilibili.worker';
import WeiboWorker from 'worker-loader!./utils/weibo.worker';
import WeiboSuperTopicWorker from 'worker-loader!./utils/weiboSuperTopic.worker';
import { requestDetail } from './services/taoba';
import { requestRoomInfo, requestWeiboInfo } from './services/services';
import NimChatroomSocket from './NimChatroomSocket';
import type { OptionsItemValue, MemberInfo } from '../types';
import type { WeiboInfo, WeiboTab, TaobaDetail, BilibiliRoomInfo, NIMMessage } from './qq.types';

export type MessageListener = (event: MessageEvent) => void | Promise<void>;

export const nimChatroomSocketList: Array<NimChatroomSocket> = []; // 缓存连接

abstract class Basic {
  public protocol: string;            // mirai或者oicq
  public id: string;                  // 当前进程的唯一ID
  public config: OptionsItemValue;    // 配置
  public groupNumbers: Array<number>; // 多个群号
  public socketHost: string;          // socket的host
  public startTime: string;           // 启动时间

  public nimChatroomSocketId?: string;            // 对应的nim的唯一socketId
  public nimChatroom?: NimChatroomSocket;         // socket
  public memberInfo?: MemberInfo;                 // 房间成员信息
  public membersList?: Array<MemberInfo>;         // 所有成员信息
  public membersCache?: Array<MemberInfo>;        // 缓存
  public ownerOnlineCache?: boolean;              // 成员是否在线
  public ownerOnlineTimer?: number;               // 判断成员是否在线的监听
  public roomEntryListener: number | null = null; // 成员进出的监听器

  public weiboLfid: string;    // 微博的lfid
  public weiboWorker?: Worker; // 微博监听
  public weiboSuperTopicLfid: string;    // 微博的超级话题lfid
  public weiboSuperTopicWorker?: Worker; // 微博超级话题监听

  public bilibiliWorker?: Worker;  // b站直播监听
  public bilibiliUsername: string; // 用户名

  public taobaInfo: { title: string; amount: number; expire: number }; // 桃叭信息

  public cronJob?: CronJob; // 定时任务

  // 定义一些方法
  abstract roomSocketMessage(event: Array<NIMMessage>): Promise<void>; // 处理单个消息
  abstract handleRoomEntryTimer: Function;                             // 轮循获取房间信息
  abstract handleOwnerOnlineTimer: Function;                           // 轮循成员是否在线
  abstract handleWeiboWorkerMessage: MessageListener;                  // 微博监听、微博超级话题监听
  abstract handleBilibiliWorkerMessage: MessageListener;               // bilibili message监听事件

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

  // 事件监听，TODO: 目前只支持同步函数
  handleRoomSocketMessage: Function = (event: Array<NIMMessage>): void => {
    this.roomSocketMessageAll(event);
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
      pocket48OwnerOnlineListener,
      pocket48MemberInfo
    }: OptionsItemValue = this.config;

    if (!pocket48RoomListener) return;

    if (!(pocket48IsAnonymous || (pocket48RoomId && pocket48Account && pocket48Token))) return;

    // 判断socket列表内是否有当前房间的socket连接
    const index: number = nimChatroomSocketList.findIndex((o: NimChatroomSocket): boolean => o.pocket48RoomId === pocket48RoomId);

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

    if ((pocket48RoomEntryListener || pocket48OwnerOnlineListener || pocket48MemberInfo) && this.membersList?.length) {
      const idx: number = this.membersList.findIndex((o: MemberInfo): boolean => o.roomId === `${ pocket48RoomId }`);

      if (idx >= 0) {
        this.memberInfo = this.membersList[idx];
        pocket48RoomEntryListener && this.handleRoomEntryTimer();
        pocket48OwnerOnlineListener && this.handleOwnerOnlineTimer();
      }
    }
  }

  // 移除socket连接
  disconnectPocket48(): void {
    const { pocket48RoomId }: OptionsItemValue = this.config;
    const index: number = nimChatroomSocketList.findIndex((o: NimChatroomSocket): boolean => o.pocket48RoomId === pocket48RoomId);

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

  // 微博初始化
  async initWeiboWorker(): Promise<void> {
    const { weiboListener, weiboUid, weiboAtAll }: OptionsItemValue = this.config;

    if (!(weiboListener && weiboUid)) return;

    const resWeiboInfo: WeiboInfo = await requestWeiboInfo(weiboUid);
    const weiboTab: Array<WeiboTab> = resWeiboInfo?.data?.tabsInfo?.tabs
      .filter((o: WeiboTab): boolean => o.tabKey === 'weibo');

    if (weiboTab.length > 0) {
      this.weiboLfid = weiboTab[0].containerid;
      this.weiboWorker = new WeiboWorker();
      this.weiboWorker.addEventListener('message', this.handleWeiboWorkerMessage, false);
      this.weiboWorker.postMessage({
        lfid: this.weiboLfid,
        weiboAtAll,
        protocol: this.protocol
      });
    } else {
      message.warn('没有获取到微博用户的相关信息！请稍后重新登录。');
    }
  }

  // 微博初始化
  initWeiboSuperTopicWorker(): void {
    const { weiboSuperTopicListener, weiboSuperTopicLfid }: OptionsItemValue = this.config;

    if (!(weiboSuperTopicListener && weiboSuperTopicLfid)) return;

    this.weiboSuperTopicLfid = weiboSuperTopicLfid;
    this.weiboSuperTopicWorker = new WeiboSuperTopicWorker();
    this.weiboSuperTopicWorker.addEventListener('message', this.handleWeiboWorkerMessage, false);
    this.weiboSuperTopicWorker.postMessage({
      lfid: this.weiboSuperTopicLfid,
      protocol: this.protocol
    });
  }

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
}

export default Basic;