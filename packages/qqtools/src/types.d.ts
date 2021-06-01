export interface EditItem {
  id: string;
  cmd: string;
  value: string;
}

// 表单内的值
export interface OptionsItemValue {
  optionName: string;
  optionType?: '0' | '1'; // 0: mirai-api-http，1: oicq
  qqNumber: number;
  groupNumber: string;
  socketHost?: string;
  socketPort: number;
  authKey: string;

  pocket48RoomListener?: boolean;
  pocket48RoomId?: string;
  pocket48IsAnonymous?: boolean;
  pocket48Account?: string;
  pocket48Token?: string;
  pocket48LiveAtAll?: boolean;
  pocket48ShieldMsgType?: Array<string>;
  pocket48RoomEntryListener?: boolean;
  pocket48MemberInfo?: boolean;
  pocket48LogSave?: boolean;
  pocket48LogDir?: string;

  weiboListener?: boolean;
  weiboUid?: string;
  weiboAtAll?: string;

  bilibiliLive?: boolean;
  bilibiliLiveId: string;
  bilibiliAtAll?: string;

  taobaListen?: boolean;
  taobaId?: string;
  taobaCommandTemplate?: string;
  taobaTemplate?: string;
  taobaRankList?: boolean;
  otherTaobaIds?: string;

  groupWelcome?: boolean;
  groupWelcomeSend?: string;

  cronJob?: boolean;
  cronTime?: string;
  cronSendData?: string;

  customCmd?: Array<EditItem>;
}

// 配置
export interface OptionsItem {
  id: string;
  name: string;
  value: OptionsItemValue;
}

export interface MemberInfo {
  id: number;
  ownerName: string;
  roomId: string;
  account: string;
}