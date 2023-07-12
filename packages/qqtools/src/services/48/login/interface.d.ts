import { Pocket48ResponseBase } from '../interface';

export interface SMSResult extends Pocket48ResponseBase {
  content: null;
}

/* 登录结果 */
export interface LoginUserInfo extends Pocket48ResponseBase {
  content: {
    userInfo: {
      token: string;
      nickname: string;
      avatar: string;
    };
    token: string;
  };
}

/* IM */
export interface IMUserInfo extends Pocket48ResponseBase {
  status: 200 | number;
  content: {
    userId: number;
    accid: string;
    pwd: string;
  };
}

/* User info reload */
interface UserItem {
  nickname: string;
  userId: number;
  avatar: string;
}

export interface UserInfoReloadOrSwitch extends Pocket48ResponseBase {
  content: UserItem & {
    token: string | null;
    bigSmallInfo: {
      bigUserInfo: UserItem;
      smallUserInfo: Array<UserItem>;
    };
  };
}