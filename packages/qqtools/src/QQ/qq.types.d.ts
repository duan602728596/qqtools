import type { UploadFileResult } from 'nim-web-sdk-ng/dist/QCHAT_BROWSER_SDK/CloudStorageServiceInterface';
import type { MiraiMessageProps } from './function/parser/mirai';

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
  messageChain: Array<MiraiMessageProps>;
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

/* 发言类型v2 */
export interface UserV2 {
  avatar: string;
  level: `${ number }`;
  nickName: string;
  roleId: number;
  teamLogo: string;
  userId: number;
  vip: boolean;
}

// roleId = 3为xox
export interface CustomMessageV2 {
  channelId: string;
  serverId: string;
  ext?: `{
    "user": {
      "avatar": ${ string },
      "level": "${ number }",
      "nickName": ${ string },
      "roleId": ${ number },
      "teamLogo": ${ string },
      "userId": ${ number },
      "vip": ${ boolean }
    }
  }`;
  type: string;
  time: number;
  updateTime: number;
}

// 普通信息
export interface TEXTMessageV2 extends CustomMessageV2 {
  type: 'text';
  body: string;
}

// 图片信息
export interface IMAGEMessageV2 extends CustomMessageV2 {
  type: 'image';
  attach: UploadFileResult;
}

// 回复信息，礼物回复信息
export interface ReplyInfo {
  replyName: string;
  replyText: string; // 被回复的消息
  text: string;      // 回复的消息
}

export interface REPLYMessageV2 extends CustomMessageV2 {
  type: 'custom';
  attach: {
    messageType: 'REPLY' | 'GIFTREPLY';
    replyInfo: ReplyInfo;
    giftReplyInfo: ReplyInfo;
  };
}

// 发送语音
export interface AUDIOMessageV2 extends CustomMessageV2 {
  type: 'audio';
  attach: UploadFileResult;
}

export interface AUDIOMessage1_V2 extends CustomMessageV2 {
  type: 'custom';
  attach: {
    messageType: 'AUDIO';
    audioInfo: {
      url: string;
    };
  };
}

// 发送短视频
export interface VIDEOMessageV2 extends CustomMessageV2 {
  type: 'video';
  attach: UploadFileResult;
}

export interface VIDEOMessage1_V2 extends CustomMessageV2 {
  type: 'custom';
  attach: {
    messageType: 'VIDEO';
    videoInfo: {
      url: string;
    };
  };
}

// 直播
export interface LIVEPUSHMessageV2 extends CustomMessageV2 {
  type: 'custom';
  attach: {
    messageType: 'LIVEPUSH';
    livePushInfo: {
      liveCover: string;
      liveTitle: string;
      liveId: string;
      shortPath: string;
    };
  };
}

// 鸡腿翻牌
export interface FlipCardInfo {
  question: string;
  answer: string;
}

export interface FLIPCARDMessageV2 extends CustomMessageV2 {
  type: 'custom';
  attach: {
    messageType: 'FLIPCARD';
    flipCardInfo: FlipCardInfo;
    filpCardInfo: FlipCardInfo;
  };
}

// 发送表情
export interface EXPRESSMessageV2 extends CustomMessageV2 {
  type: 'custom';
  attach: {
    messageType: 'EXPRESS';
  };
}

// 删除回复
export interface DELETEMessageV2 extends CustomMessageV2 {
  type: 'custom';
  attach: {
    messageType: 'DELETE';
    targetId: string;
  };
}

// 禁言
export interface DISABLE_SPEAKMessageV2 extends CustomMessageV2 {
  type: 'custom';
  attach: {
    messageType: 'DISABLE_SPEAK';
    targetId: string;
    sourceId: string;
  };
}

// 电台
export interface SESSION_DIANTAIMessageV2 extends CustomMessageV2 {
  type: 'custom';
  attach: {
    messageType: 'SESSION_DIANTAI';
    streamPath: string;
  };
}

// 语音翻牌
export interface FlipCardAudioInfo {
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

export interface FLIPCARD_AUDIOMessageV2 extends CustomMessageV2 {
  type: 'custom';
  attach: {
    messageType: 'FLIPCARD_AUDIO';
    flipCardInfo: FlipCardAudioInfo;
    flipCardAudioInfo: FlipCardAudioInfo;
    filpCardInfo: FlipCardAudioInfo;
    filpCardAudioInfo: FlipCardAudioInfo;
  };
}

// 视频翻牌
export interface FlipCardVideoInfo {
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

export interface FLIPCARD_VIDEOMessageV2 extends CustomMessageV2 {
  type: 'custom';
  attach: {
    messageType: 'FLIPCARD_VIDEO';
    flipCardInfo: FlipCardVideoInfo;
    flipCardVideoInfo: FlipCardVideoInfo;
    filpCardInfo: FlipCardVideoInfo;
    filpCardVideoInfo: FlipCardVideoInfo;
  };
}

// 2021表情包
export interface EXPRESSIMAGEMessageV2 extends CustomMessageV2 {
  type: 'custom';
  attach: {
    messageType: 'EXPRESSIMAGE';
    expressImgInfo: {
      emotionRemote: string;
    };
    expressImageInfo: {
      emotionRemote: string;
    };
    emotionRemote: string;
  };
}

// open live
export interface OPEN_LIVEMessageV2 extends CustomMessageV2 {
  type: 'custom';
  attach: {
    messageType: 'OPEN_LIVE';
    openLiveInfo: {
      title: string;
      id: number;
      coverUrl: string;
      jumpPath: string;
    };
  };
}

// trip info
export interface TRIP_INFOMessageV2 extends CustomMessageV2 {
  type: 'custom';
  attach: {
    messageType: 'TRIP_INFO';
    tripInfo: {
      tripType: string;
      id: number;
      title: string;
      describe: string;
      jumpPath: string;
      jumpType: string;
    };
  };
}

// 礼物
export interface PRESENT_NORMALMessageV2 extends CustomMessageV2 {
  type: 'custom';
  attach: {
    messageType: 'PRESENT_NORMAL';
    giftInfo: {
      giftName: string;
      picPath: string;
    };
  };
}

// 投票信息：投票时，同时触发 PRESENT_TEXT 和 PRESENT_FULLSCREEN 两种类型
export interface PRESENT_TEXTMessageV2 extends CustomMessageV2 {
  type: 'custom';
  attach: {
    messageType: 'PRESENT_TEXT';
    giftInfo: {
      fullPicPath?: string; // 完整图片，图片地址以 https://source.48.cn/ 开头
      giftId: string;
      giftName: `${ number }投票权`; // 礼物名称
      giftNum: number;  // 礼物数量
      picPath: string;
      special: true;
    };
  };
}

// 发起投票
export interface VOTEMessageV2 extends CustomMessageV2 {
  type: 'custom';
  attach: {
    messageType: 'VOTE';
    voteInfo: {
      text: string;
      content: string;
    };
  };
}

// 房间关闭信息
export interface CLOSE_ROOM_CHATMessageV2 extends CustomMessageV2 {
  type: 'custom';
  attach: {
    messageType: 'CLOSE_ROOM_CHAT';
  };
}

// 中秋活动
export interface ZHONGQIU_ACTIVITY_LANTERN_FANSMessageV2 extends CustomMessageV2 {
  type: 'custom';
  attach: {
    messageType: 'ZHONGQIU_ACTIVITY_LANTERN_FANS';
  };
}

export type CustomMessageAllV2 =
  | TEXTMessageV2
  | REPLYMessageV2
  | IMAGEMessageV2
  | AUDIOMessageV2
  | VIDEOMessageV2
  | AUDIOMessage1_V2
  | VIDEOMessage1_V2
  | LIVEPUSHMessageV2
  | FLIPCARDMessageV2
  | EXPRESSMessageV2
  | DELETEMessageV2
  | DISABLE_SPEAKMessageV2
  | SESSION_DIANTAIMessageV2
  | FLIPCARD_AUDIOMessageV2
  | FLIPCARD_VIDEOMessageV2
  | EXPRESSIMAGEMessageV2
  | OPEN_LIVEMessageV2
  | TRIP_INFOMessageV2
  | PRESENT_NORMALMessageV2
  | PRESENT_TEXTMessageV2
  | VOTEMessageV2
  | CLOSE_ROOM_CHATMessageV2
  | ZHONGQIU_ACTIVITY_LANTERN_FANSMessageV2;


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

// 微博超话
export interface WeiboSuperTopicContainerCard {
  show_type: '1'; // 帖子列表
  card_group: Array<WeiboCard>;
}

export interface WeiboSuperTopicContainerList {
  ok: number;
  data: {
    pageInfo: {
      nick: string;
      page_title: string;
    };
    cards: Array<WeiboSuperTopicContainerCard>;
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

/* 抖音 */
type noProtocolUrl = `//${ string }`;

export interface VideoInfoItem {
  bitRateList: Array<{
    playApi: noProtocolUrl;
    playAddr: Array<{
      src: noProtocolUrl;
    }>;
    width: number;
    height: number;
  }>;
  playAddr: Array<{
    src: noProtocolUrl;
  }>;
  playApi: noProtocolUrl | ''; // 无水印
  ratio: string;
  cover: noProtocolUrl;
  coverUrlList: Array<string>;
}

export interface UserItem1 {
  odin: {
    user_id: string;
    user_is_auth: number;
    user_type: number;
    user_unique_id: string;
  };
  logId: string;
  pathname: string;
}

export interface UserDataItem {
  awemeId: string;
  desc: string;
  video: VideoInfoItem;
  createTime: number;
  tag: {
    inReviewing: boolean;
    isStory: boolean;
    isTop: boolean;
    relationLabels: boolean;
    reviewStatus: number;
  };
}

export interface UserItem2 {
  uid: string;
  post: {
    cursor: number;
    maxCursor: number;
    minCursor: number;
    data: Array<UserDataItem>;
    hasMore: 1 | 0;
  };
  user: {
    user: {
      customVerify: string;
      desc: string;
      nickname: string;
      uid: string;
      uniqueId: string;
      secUid: string;
    };
  };
}

export interface UserScriptRendedData {
  _location: string;
  [key: `${ number }`]: UserItem1 | UserItem2;
}