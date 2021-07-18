export interface AuthResponse {
  code: number;
  session: string;
}

export interface MessageResponse {
  code: number;
  msg: string;
}

export interface AboutResponse {
  code: number;
  msg?: string;          // v1
  errorMessage?: string; // v2
  data: {
    version: string;
  };
}

/**
 * 发送的信息类型
 * 类型文档：https://github.com/project-mirai/mirai-api-http/blob/master/docs/MessageType.md
 */
export interface Plain {
  type: 'Plain';
  text: string;
}

export interface Image {
  type: 'Image';
  url?: string;
  path?: string;
}

export interface At {
  type: 'At';
  target: number;
  display: 'name';
}

export interface AtAll {
  type: 'AtAll';
  target: 0;
}

export type MessageChain = Plain | Image | At | AtAll;

/* socket信息 */
// 群信息
export interface MessageSocketEventData {
  type: string; // GroupMessage 群信息
  sender: {
    id: number; // qq号
    group: {
      id: number; // 群号
    };
  };
  messageChain: Array<MessageChain>;
}

export interface MessageSocketEventDataV2 {
  syncId: string;
  data: MessageSocketEventData;
}

// event
export interface EventSocketEventData {
  type: string; // MemberJoinEvent 有人进群
  member: {
    id: number; // qq号
    group: {
      id: number; // 群号
    };
    memberName: string;
  };
}

export interface EventSocketEventDataV2 {
  syncId: string;
  data: EventSocketEventData;
}

/* sdk类型 */
export interface NIMError {
  code: number | string;
  message: string;
}

export interface NIMMessage {
  custom: string;
  file: {
    url: string;
  };
  time: number;
}

/* 发言类型 */
export interface CustomMessage {
  messageType: string;
  sessionRole: number; // 判断是否为房间信息
  user: {
    nickName: string;
    avatar: string;
    teamLogo: string;
  };
}

// 普通信息
export interface TEXTMessage extends CustomMessage {
  messageType: 'TEXT';
  text: string;
}

// 回复信息，礼物回复信息
export interface REPLYMessage extends CustomMessage {
  messageType: 'REPLY' | 'GIFTREPLY';
  replyName: string;
  replyText: string;
  text: string;
}

// 图片信息
export interface IMAGEMessage extends CustomMessage {
  messageType: 'IMAGE';
}

// 语音信息
export interface AUDIOMessage extends CustomMessage {
  messageType: 'AUDIO';
}

// 发送短视频
export interface VIDEOMessage extends CustomMessage {
  messageType: 'VIDEO';
}

// 直播
export interface LIVEPUSHMessage extends CustomMessage {
  messageType: 'LIVEPUSH';
  liveTitle: string;
  liveCover: string;
  liveId: string;
}

// 鸡腿翻牌
export interface FLIPCARDMessage extends CustomMessage {
  messageType: 'FLIPCARD';
  question: string;
  answer: string;
  roomId: string;
}

// 发送表情
export interface EXPRESSMessage extends CustomMessage {
  messageType: 'EXPRESS';
}

// 删除回复
export interface DELETEMessage extends CustomMessage {
  messageType: 'DELETE';
}

// 禁言
export interface DISABLE_SPEAKMessage extends CustomMessage {
  messageType: 'DISABLE_SPEAK';
  targetId: string;
  sourceId: string;
}

// 电台
export interface SESSION_DIANTAIMessage extends CustomMessage {
  messageType: 'SESSION_DIANTAI';
  streamPath: string;
}

// 语音翻牌
export interface FLIPCARD_AUDIOMessage extends CustomMessage {
  messageType: 'FLIPCARD_AUDIO';
  answer: `{
    "url": "${ string }.aac",
    "duration": ${ number },
    "size": ${ number }
  }`;
  answerId: string;
  answerType: string;
  question: string;
  questionId: string;
  sourceId: string;
  roomId: string;
}

// 视频翻牌
export interface FLIPCARD_VIDEOMessage extends CustomMessage {
  messageType: 'FLIPCARD_VIDEO';
  answer: `{
    "url": "${ string }.mp4",
    "duration": ${ number },
    "size": ${ number },
    "previewImg": "${ string }",
    "width": ${ number },
    "height": ${ number }
  }`;
  answerId: string;
  answerType: string;
  question: string;
  questionId: string;
  sourceId: string;
  roomId: string;
}

// open live
export interface OPEN_LIVEMessage extends CustomMessage {
  messageType: 'OPEN_LIVE';
  title: string;
  id: number;
  coverUrl: string;
  jumpPath: string;
}

// trip info
export interface TRIP_INFOMessage extends CustomMessage {
  messageType: 'TRIP_INFO';
  tripType: string;
  id: number;
  title: string;
  describe: string;
  jumpPath: string;
  jumpType: string;
}

// 投票信息：投票时，同时触发 PRESENT_TEXT 和 PRESENT_FULLSCREEN 两种类型
export interface PRESENT_TEXTMessage extends CustomMessage {
  messageType: 'PRESENT_TEXT';
  sessionRole: 0;
  giftInfo: {
    fullPicPath?: string; // 完整图片，图片地址以 https://source.48.cn/ 开头
    giftId: string;
    giftName: `${ number }投票权`; // 礼物名称
    giftNum: number;  // 礼物数量
    picPath: string;
    special: true;
  };
}

// 房间关闭信息
export interface CLOSE_ROOM_CHATMessage extends CustomMessage {
  messageType: 'CLOSE_ROOM_CHAT';
}

export type CustomMessageAll =
  | TEXTMessage
  | REPLYMessage
  | IMAGEMessage
  | AUDIOMessage
  | VIDEOMessage
  | LIVEPUSHMessage
  | FLIPCARDMessage
  | EXPRESSMessage
  | DELETEMessage
  | DISABLE_SPEAKMessage
  | SESSION_DIANTAIMessage
  | FLIPCARD_AUDIOMessage
  | FLIPCARD_VIDEOMessage
  | OPEN_LIVEMessage
  | TRIP_INFOMessage
  | PRESENT_TEXTMessage
  | CLOSE_ROOM_CHATMessage;

/* 微博类型 */
export interface WeiboTab {
  containerid: string;
  title: string;
  tabKey: string;
}

export interface WeiboInfo {
  ok: number;
  data: {
    tabsInfo: {
      tabs: Array<WeiboTab>;
    };
  };
}

export interface WeiboMBlog {
  id: string;
  user: {
    screen_name: string;     // 微博名
  };
  retweeted_status?: object; // 有为转载，没有为原创
  created_at: string;        // 发微博的时间
  text: string;              // 微博文字
  pics?: {
    url: string;             // 图片
  }[];
}

export interface WeiboCard {
  card_type: number;
  mblog: WeiboMBlog;
  scheme: string;
  _id: bigint;
}

export interface WeiboContainerList {
  ok: number;
  data: {
    cards: Array<WeiboCard>;
  };
}

export interface WeiboSendData {
  id: bigint;
  name: string;
  type: string;
  scheme: string;
  time: string;
  text: string;
  pics: Array<string>;
}

/* b站 */
export interface BilibiliRoomInfo {
  code: number;
  message: string;
  ttl: number;
  data: {
    anchor_info: {
      base_info: {
        uname: string;
      };
    };
  };
}

export interface BilibiliLiveStatus {
  code: number;
  message: string;
  msg: string;
  data: {
    live_status: number; // 1是直播
  };
}

/* 桃叭 */
export interface TaobaDetailDatasItem {
  title: string;    // 项目名称
  donation: number; // 已集资金额
  amount: number;   // 集资总金额
  expire: number;   // 项目结束时间（时间戳，秒）
  desc: string;     // 项目介绍
}

export interface TaobaDetail {
  code: number;
  datas: TaobaDetailDatasItem;
}

export interface TaobaIdolsJoinItem {
  avatar: string;
  flower: number;
  id: number;
  money: string;
  nick: string;
  sn: string;
  stime: number;
  userid: number;
}

export interface TaobaRankItem extends TaobaIdolsJoinItem {
  id: string;
  userid: string;
}

export interface TaobaIdolsJoin {
  code: number;
  list: Array<TaobaIdolsJoinItem>;
  mine: null | any;
}

export interface TaobaJoinRank extends TaobaIdolsJoin {
  juser: number;
  stime: number;
  list: Array<TaobaRankItem>;
}