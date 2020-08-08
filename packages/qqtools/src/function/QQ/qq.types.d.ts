export interface AuthResponse {
  code: number;
  session: string;
}

export interface MessageResponse {
  code: number;
  msg: string;
}

// 发送的信息类型
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