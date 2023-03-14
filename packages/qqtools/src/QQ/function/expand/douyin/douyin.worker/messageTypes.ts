import type { QQProtocol } from '../../../../QQBotModals/ModalTypes';

// 关闭消息
export interface CloseMessage {
  close: true;
}

// 初始化消息
interface BaseInitMessage {
  userId: string;
  webId: string;
  description: string;
  protocol: QQProtocol;
  port: number;
  intervalTime: number | undefined;
  isSendDebugMessage: boolean;
  cookieString: string;
}

export type MessageObject = CloseMessage | BaseInitMessage;

// 判断各种类型
type IsMessageFunction<T extends MessageObject> = (d: MessageObject) => d is T;

export const isCloseMessage: IsMessageFunction<CloseMessage> = (d: MessageObject): d is CloseMessage => !!d['close'];