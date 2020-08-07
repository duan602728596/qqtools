// 表单内的值
export interface OptionsItemValue {
  optionName: string;
  qqNumber: number;
  groupNumber: number;
  socketPort: number;
  authKey: string;

  pocket48RoomListener?: boolean;
  pocket48RoomId?: string;
  pocket48Account?: string;

  weiboListener?: boolean;
  weiboLfid?: string;
}

// 配置
export interface OptionsItem {
  id: string;
  name: string;
  value: OptionsItemValue;
}