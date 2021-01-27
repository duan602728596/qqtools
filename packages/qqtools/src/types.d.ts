export interface EditItem {
  id: string;
  cmd: string;
  value: string;
}

// 表单内的值
export interface OptionsItemValue {
  optionName: string;
  qqNumber: number;
  groupNumber: string;
  socketPort: number;
  authKey: string;

  pocket48RoomListener?: boolean;
  pocket48RoomId?: string;
  pocket48Account?: string;
  pocket48LiveAtAll?: boolean;
  pocket48ShieldMsgType?: Array<string>;
  pocket48RoomEntryListener?: boolean;

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