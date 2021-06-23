import type { CronJob } from 'cron';
import type NimChatroomSocket from './NimChatroomSocket';
import type { OptionsItemValue, MemberInfo } from '../types';

class Basic {
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
  public roomEntryListener: number | null = null; // 成员进出的监听器

  public weiboLfid: string;    // 微博的lfid
  public weiboWorker?: Worker; // 微博监听

  public bilibiliWorker?: Worker;  // b站直播监听
  public bilibiliUsername: string; // 用户名

  public taobaInfo: { title: string; amount: number; expire: number }; // 桃叭信息

  public cronJob?: CronJob; // 定时任务
}

export default Basic;