import type { QQProtocol } from './QQ/QQBotModals/ModalTypes';
import type { XHSProtocol } from './QQ/function/expand/xiaohongshu/xiaohongshu.worker/messageTypes';

export interface EditItem {
  id: string;
  cmd: string;
  isRegexp?: boolean;
  value: string;
}

/* ========== 一些基础的配置 ========== */
/** @deprecated */
type OldOptionType = '0' | '2' | '100' | 0;

export interface OptionsItemBasic {
  optionName: string;
  optionType: QQProtocol | OldOptionType; // 0: mirai-api-http，2: go-cqhttp
  qqNumber: number;
  groupNumber: string;
  socketHost?: string;
  socketPort: number;
  reverseWebsocket?: boolean;
  authKey: string;
  // 群欢迎
  groupWelcome?: boolean;
  groupWelcomeSend?: string;
  // 自定义命令
  customCmd?: Array<EditItem>;
}

/**
 * 口袋48
 * @deprecated
 */
export interface OptionsItemPocket48 {
  pocket48RoomListener?: boolean;
  pocket48RoomId?: string;
  pocket48IsAnonymous?: boolean;
  pocket48Account?: string;
  pocket48Token?: string;
  pocket48LiveAtAll?: boolean;
  pocket48ShieldMsgType?: Array<string>;
  pocket48RoomEntryListener?: boolean;
  pocket48OwnerOnlineListener?: boolean;
  pocket48MemberInfo?: boolean;
  pocket48LogSave?: boolean;
  pocket48LogDir?: string;
}

export interface OptionsItemPocket48V2 {
  pocket48RoomListener?: boolean;
  pocket48ServerId?: string;
  pocket48Account?: string;
  pocket48Token?: string;
  pocket48LiveAtAll?: boolean;
  pocket48ShieldMsgType?: Array<string>;
  pocket48SystemMessage?: boolean;
  pocket48MemberInfo?: boolean;
  pocket48LogSave?: boolean;
  pocket48LogDir?: string;

  // 直播间信息
  pocket48LiveListener?: boolean;
  pocket48LiveRoomId?: string;
  pocket48LiveRoomSendGiftInfo?: boolean;
  pocket48LiveRoomSendGiftLeaderboard?: boolean;
}

// 微博
export interface OptionsItemWeibo {
  weiboListener?: boolean;
  weiboUid?: string;
  weiboAtAll?: string;
  weiboSuperTopicListener?: boolean;
  weiboSuperTopicLfid?: string;
}

// 抖音
export interface OptionsItemDouyin {
  douyinListener?: boolean;
  userId: string;
  description: string;
  cookieString?: string;
  intervalTime?: number;
  isSendDebugMessage?: boolean;
}

// bilibili
export interface OptionsItemBilibili {
  bilibiliLive?: boolean;
  bilibiliLiveId: string;
  bilibiliAtAll?: string;
}

export interface OptionsItemBilibiliFeedSpace {
  bilibiliFeedSpaceListener?: boolean;
  bilibiliFeedSpaceId: string;
  cookieString?: string;
}

// 小红书
export interface OptionsItemXiaohongshu {
  xiaohongshuListener?: boolean;
  userId: string;
  description: string;
  cacheFile: string;
  isSendDebugMessage?: boolean;
}

// 定时任务
export interface OptionsItemCronTimer {
  cronJob?: boolean;
  cronTime?: string;
  cronSendData?: string;
}

// 表单内的值
export interface OptionsItemValue extends
  OptionsItemBasic,
  OptionsItemPocket48,
  OptionsItemWeibo,
  OptionsItemBilibili,
  OptionsItemCronTimer {}

// 表单内的值v2，将部分字段转换成数组，从而支持多个配置
export interface OptionsItemValueV2 extends OptionsItemBasic {
  version: 'v2';
  pocket48V2?: Array<OptionsItemPocket48V2>;
  pocket48?: Array<OptionsItemPocket48>;
  weibo?: Array<OptionsItemWeibo>;
  douyin?: Array<OptionsItemDouyin>;
  bilibili?: Array<OptionsItemBilibili>;
  bilibiliFeedSpace?: Array<OptionsItemBilibiliFeedSpace>;
  xiaohongshuProtocol?: XHSProtocol;
  xiaohongshu?: Array<OptionsItemXiaohongshu>;
  cronTimer?: Array<OptionsItemCronTimer>;
}

// 配置
export interface OptionsItem {
  id: string;
  name: string;
  value: OptionsItemValueV2;
}

export interface MemberInfo {
  id: number;
  ownerName: string;
  roomId: string;
  account: string;
  serverId: string;
}