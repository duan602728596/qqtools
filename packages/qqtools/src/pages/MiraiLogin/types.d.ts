// mirai的登陆协议
export type ProtocolType = 'ANDROID_PAD' | 'ANDROID_PHONE' | 'ANDROID_WATCH';

export interface QQLoginItem {
  qq: string;
  lastLoginTime: string;
  password: string;
  autoLogin: boolean;
  protocol?: ProtocolType;
}