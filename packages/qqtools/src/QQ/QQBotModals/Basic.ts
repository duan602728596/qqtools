import Pocket48V2Expand from '../expand/Pocket48V2Expand';
import WeiboExpand from '../expand/WeiboExpand';
import DouyinExpand from '../expand/DouyinExpand';
import BilibiliExpand from '../expand/BilibiliExpand';
import CronTimerExpand from '../expand/CronTimerExpand';
import QChatSocket from '../sdk/QChatSocket';
import { QQProtocol, type QQModals } from './ModalTypes';
import type { OptionsItemValueV2, MemberInfo } from '../../commonTypes';

export type MessageListener = (event: MessageEvent) => void | Promise<void>;

export const qChatSocketList: Array<QChatSocket> = [];

export interface BasicImplement<MessageType> {
  sendMessage(value: MessageType, groupId?: number): void | Promise<void>;
  init(): boolean | Promise<boolean>;
  destroy(): boolean | Promise<boolean>;
}

abstract class Basic {
  public protocol: QQProtocol;        // mirai或者oicq
  public id: string;                  // 当前进程的唯一ID
  public config: OptionsItemValueV2;  // 配置
  public groupNumbers: Array<number>; // 多个群号
  public socketHost: string;          // socket的host
  public startTime: string;           // 启动时间

  public membersList?: Array<MemberInfo>; // 所有成员信息

  public pocket48V2: Array<Pocket48V2Expand> | undefined;
  public weibo: Array<WeiboExpand> | undefined;
  public douyin: Array<DouyinExpand> | undefined;
  public bilibili: Array<BilibiliExpand> | undefined;
  public cronTimer: Array<CronTimerExpand> | undefined;

  static async initExpand(this: QQModals): Promise<void> {
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

    if (this.config.douyin) {
      this.douyin = [];

      for (const item of this.config.douyin) {
        const douyin: DouyinExpand = new DouyinExpand({
          qq: this,
          config: item,
          protocol: this.protocol
        });

        douyin.initDouyinWorker();
        this.douyin.push(douyin);
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

  static destroyExpand(this: QQModals): void {
    // 销毁口袋监听
    if (this.pocket48V2) {
      this.pocket48V2.forEach((item: Pocket48V2Expand): unknown => item.destroy());
      this.pocket48V2 = undefined;
    }

    // 销毁微博监听
    if (this.weibo) {
      this.weibo.forEach((item: WeiboExpand): unknown => item.destroy());
      this.weibo = undefined;
    }

    // 销毁抖音监听
    if (this.douyin) {
      this.douyin.forEach((item: DouyinExpand): unknown => item.destroy());
      this.douyin = undefined;
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
}

export default Basic;