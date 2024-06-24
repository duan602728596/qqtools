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
  cookieString: string | undefined;
  protocol: QQProtocol;
  intervalTime: number | undefined;
  isSendDebugMessage: boolean;
}

export interface SignMessage {
  type: 'sign';
  id: string;
  result: string;
}

export type MessageObject = CloseMessage | BaseInitMessage | SignMessage;

// 判断各种类型
type IsMessageFunction<T extends MessageObject> = (d: MessageObject) => d is T;

export const isCloseMessage: IsMessageFunction<CloseMessage> = (d: MessageObject): d is CloseMessage => !!d['close'];

export const isSignMessage: IsMessageFunction<SignMessage> = (d: MessageObject): d is SignMessage => d['type'] === 'sign';