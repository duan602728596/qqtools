import Pocket48Expand from './expand/Pocket48Expand';
import Pocket48V2Expand from './expand/Pocket48V2Expand';
import WeiboExpand from './expand/WeiboExpand';
import BilibiliExpand from './expand/BilibiliExpand';
import CronTimerExpand from './expand/CronTimerExpand';
import NimChatroomSocket from './NimChatroomSocket';
import QChatSocket from './QChatSocket';
import type QQ from './QQ';
import type OicqQQ from './OicqQQ';
import type { OptionsItemValueV2, MemberInfo } from '../commonTypes';

export type MessageListener = (event: MessageEvent) => void | Promise<void>;

export const nimChatroomSocketList: Array<NimChatroomSocket> = []; // 缓存连接
export const qChatSocketList: Array<QChatSocket> = [];

abstract class Basic {
  public protocol: string;            // mirai或者oicq
  public id: string;                  // 当前进程的唯一ID
  public config: OptionsItemValueV2;  // 配置
  public groupNumbers: Array<number>; // 多个群号
  public socketHost: string;          // socket的host
  public startTime: string;           // 启动时间

  public membersList?: Array<MemberInfo>; // 所有成员信息

  public pocket48: Array<Pocket48Expand> | undefined;
  public pocket48V2: Array<Pocket48V2Expand> | undefined;
  public weibo: Array<WeiboExpand> | undefined;
  public bilibili: Array<BilibiliExpand> | undefined;
  public cronTimer: Array<CronTimerExpand> | undefined;

  static async initExpand(this: QQ | OicqQQ): Promise<void> {
    if (this.config.pocket48V2) {
      this.pocket48V2 = [];

      for (const item of this.config.pocket48V2) {
        const pocket48: Pocket48V2Expand = new Pocket48V2Expand({
          qq: this,
          config: item
        });

        await pocket48.initPocket48();
        this.pocket48V2.push(pocket48);
      }
    }

    if (this.config.pocket48) {
      this.pocket48 = [];

      for (const item of this.config.pocket48) {
        const pocket48: Pocket48Expand = new Pocket48Expand({
          qq: this,
          config: item
        });

        await pocket48.initPocket48();
        this.pocket48.push(pocket48);
      }
    }

    if (this.config.weibo) {
      this.weibo = [];

      for (const item of this.config.weibo) {
        const weibo: WeiboExpand = new WeiboExpand({
          qq: this,
          config: item,
          protocol: this.protocol
        });

        await Promise.all([
          weibo.initWeiboWorker(),
          weibo.initWeiboSuperTopicWorker()
        ]);
        this.weibo.push(weibo);
      }
    }

    if (this.config.bilibili) {
      this.bilibili = [];

      for (const item of this.config.bilibili) {
        const bilibili: BilibiliExpand = new BilibiliExpand({ qq: this, config: item });

        await bilibili.initBilibiliWorker();
        this.bilibili.push(bilibili);
      }
    }

    if (this.config.cronTimer) {
      this.cronTimer = [];

      for (const item of this.config.cronTimer) {
        const cronTimer: CronTimerExpand = new CronTimerExpand({ qq: this, config: item });

        await cronTimer.initCronJob();
        this.cronTimer.push(cronTimer);
      }
    }
  }

  static destroyExpand(this: QQ | OicqQQ): void {
    // 销毁口袋监听
    if (this.pocket48V2) {
      this.pocket48V2.forEach((item: Pocket48V2Expand): unknown => item.destroy());
      this.pocket48V2 = undefined;
    }

    if (this.pocket48) {
      this.pocket48.forEach((item: Pocket48Expand): unknown => item.destroy());
      this.pocket48 = undefined;
    }

    // 销毁微博监听
    if (this.weibo) {
      this.weibo.forEach((item: WeiboExpand): unknown => item.destroy());
      this.weibo = undefined;
    }

    // 销毁bilibili监听
    if (this.bilibili) {
      this.bilibili.forEach((item: BilibiliExpand): unknown => item.destroy());
      this.bilibili = undefined;
    }

    // 销毁定时任务
    if (this.cronTimer) {
      this.cronTimer.forEach((item: CronTimerExpand): unknown => item.destroy());
      this.cronTimer = undefined;
    }
  }

  // 输出当前房间的游客信息
  async membersInRoom(groupId: number): Promise<void> {
    if (this.pocket48) {
      for (const item of this.pocket48) {
        await item.membersInRoom(groupId);
      }
    }
  }
}

export default Basic;