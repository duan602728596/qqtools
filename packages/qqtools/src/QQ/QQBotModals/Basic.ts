import { message } from 'antd';
import type { MessageInstance } from 'antd/es/message/interface';
import Pocket48V2Expand from '../function/expand/pocket48/Pocket48V2Expand';
import WeiboExpand from '../function/expand/weibo/WeiboExpand';
import DouyinExpand from '../function/expand/douyin/DouyinExpand';
import BilibiliExpand from '../function/expand/bilibili/live/BilibiliExpand';
import BilibiliFeedSpaceExpend from '../function/expand/bilibili/feedSpace/BilibiliFeedSpaceExpend';
import XiaohongshuExpand from '../function/expand/xiaohongshu/XiaohongshuExpand';
import CronTimerExpand from '../function/expand/cronTimer/CronTimerExpand';
import { QQProtocol, type QQModals } from './ModalTypes';
import { detectPort, getExecutablePath } from '../../utils/utils';
import { XHSProtocol } from '../function/expand/xiaohongshu/xiaohongshu.worker/messageTypes';
import type QChatSocket from '../sdk/QChatSocket';
import type NimChatroomSocket from '../sdk/NimChatroomSocket';
import type { MemberInfo, OptionsItemValueV2, OptionsItemXiaohongshu } from '../../commonTypes';

export type MessageListener = (event: MessageEvent) => void | Promise<void>;

export const qChatSocketList: Array<QChatSocket> = [];
export const nimChatroomList: Array<NimChatroomSocket> = [];

export interface BasicImplement<MessageType> {
  sendMessage(value: MessageType, groupId?: number): void | Promise<void>;
  init(): boolean | Promise<boolean>;
  destroy(): boolean | Promise<boolean>;
}

export interface BasicArgs {
  id: string;
  config: OptionsItemValueV2;
  membersList?: Array<MemberInfo>;
  messageApi?: MessageInstance;
}

interface KeyType {
  pocket48V2: Pocket48V2Expand;
  weibo: WeiboExpand;
  douyin: DouyinExpand;
  bilibili: BilibiliExpand;
  bilibiliFeedSpace: BilibiliFeedSpaceExpend;
  xiaohonshu: XiaohongshuExpand;
  cronTimer: CronTimerExpand;
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
  public bilibiliFeedSpace: Array<BilibiliFeedSpaceExpend> | undefined;
  public xiaohonshu: Array<XiaohongshuExpand> | undefined;
  public cronTimer: Array<CronTimerExpand> | undefined;
  messageApi: typeof message | MessageInstance = message;

  static async initExpand(this: QQModals): Promise<void> {
    if (this.config.pocket48V2) {
      this.pocket48V2 = [];

      for (const item of this.config.pocket48V2) {
        const pocket48: Pocket48V2Expand = new Pocket48V2Expand({
          qq: this,
          config: item,
          membersList: this.membersList
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
          protocol: this.protocol,
          messageApi: this.messageApi
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
          protocol: this.protocol,
          messageApi: this.messageApi
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

    if (this.config.bilibiliFeedSpace) {
      this.bilibiliFeedSpace = [];

      for (const item of this.config.bilibiliFeedSpace) {
        const bilibiliFeedSpace: BilibiliFeedSpaceExpend = new BilibiliFeedSpaceExpend({ qq: this, config: item });

        bilibiliFeedSpace.initBilibiliFeedSpaceWorker();
        this.bilibiliFeedSpace.push(bilibiliFeedSpace);
      }
    }

    if (
      this.config?.xiaohongshu?.length
      && this.config.xiaohongshu.some((c: OptionsItemXiaohongshu): boolean => !!c.xiaohongshuListener)
    ) {
      this.xiaohonshu = [];

      const signProtocol: XHSProtocol = this.config.xiaohongshuProtocol ?? XHSProtocol.ChromeDevtoolsProtocol;
      const port: number = await detectPort(22550);
      const executablePath: string | null = getExecutablePath();

      if (signProtocol === XHSProtocol.ChromeDevtoolsProtocol) {
        if (executablePath) {
          await XiaohongshuExpand.chromeDevtoolsInit(executablePath, port);
        } else {
          message.warning('小红书监听需要配置无头浏览器！');
        }
      } else if (signProtocol === XHSProtocol.ElectronInjectServer) {
        await XiaohongshuExpand.windowInit();
      }

      const cookie: string = signProtocol === XHSProtocol.ChromeDevtoolsProtocol
        ? await XiaohongshuExpand.chromeDevtoolCookie()
        : await XiaohongshuExpand.cookie(port);

      for (const item of this.config.xiaohongshu) {
        const xiaohonshu: XiaohongshuExpand = new XiaohongshuExpand({
          qq: this,
          config: item,
          protocol: this.protocol,
          messageApi: this.messageApi,
          port,
          cookie,
          signProtocol
        });

        xiaohonshu.initXiaohongshuWorker();
        this.xiaohonshu.push(xiaohonshu);
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

  destroyOne(key: keyof KeyType): void {
    const expandItem: Array<KeyType[keyof KeyType]> | undefined = this[key];

    if (expandItem) {
      expandItem.forEach((item: KeyType[keyof KeyType]): unknown => item.destroy());
    }
  }

  static destroyExpand(this: QQModals): void {
    const keyArray: Array<keyof KeyType> = ['pocket48V2', 'weibo', 'douyin', 'bilibili', 'bilibiliFeedSpace', 'xiaohonshu', 'cronTimer'];

    for (const key of keyArray) {
      this.destroyOne(key);
    }
  }

  protected constructor(args: BasicArgs) {
    args.messageApi && (this.messageApi = args.messageApi);
  }
}

export default Basic;