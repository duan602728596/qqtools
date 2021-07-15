export interface LoginInfo {
  status: 200 | number;
  success: boolean;
  content: {
    userInfo: {
      userId: number;
      nickname: string;
      token: string;
    };
    token: string;
  };
}

export interface IMUserInfo {
  status: 200 | number;
  success: boolean;
  content: {
    userId: number;
    accid: string;
    pwd: string;
  };
}