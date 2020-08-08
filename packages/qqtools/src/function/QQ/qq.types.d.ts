export interface AuthResponse {
  code: number;
  session: string;
}

export interface MessageResponse {
  code: number;
  msg: string;
}

/* 发送的信息类型 */
export interface Plain {
  type: 'Plain';
  text: string;
}

export interface Image {
  type: 'Image';
  url: string;
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
export interface MessageEventData {
  type: string; // GroupMessage 群信息
  sender: {
    id: number; // qq号
    group: {
      id: number; // 群号
    };
  };
  messageChain: Array<MessageChain>;
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
  };
}

// 普通信息
export interface TEXTMessage extends CustomMessage {
  messageType: 'TEXT';
  text: string;
}

// 回复信息
export interface REPLYMessage extends CustomMessage {
  messageType: 'REPLY';
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
}

// 鸡腿翻牌
export interface FLIPCARDMessage extends CustomMessage {
  messageType: 'FLIPCARD';
  question: string;
  answer: string;
}

// 发送表情
export interface EXPRESSMessage extends CustomMessage {
  messageType: 'EXPRESS';
}

// 删除回复
export interface DELETEMessage extends CustomMessage {
  messageType: 'DELETE';
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
  | DELETEMessage;

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
  _id: BigInt;
}

export interface WeiboContainerList {
  ok: number;
  data: {
    cards: Array<WeiboCard>;
  };
}

export interface WeiboSendData {
  id: BigInt;
  name: string;
  type: string;
  scheme: string;
  time: string;
  text: string;
  pics: Array<string>;
}