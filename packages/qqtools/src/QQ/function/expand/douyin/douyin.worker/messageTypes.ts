import type { Cookie } from 'playwright-core';
import type { QQProtocol } from '../../../../QQBotModals/ModalTypes';

// 关闭消息
export interface CloseMessage {
  close: true;
}

// 无头浏览器需要的cookie
export interface CookieMessage {
  type: 'cookie';
  cookie: Array<Cookie>;
}

// 获取X-Bogus的值
export interface XBogusMessageData {
  type: 'X-Bogus';
  value: string;
}

// 初始化消息
interface BaseInitMessage {
  userId: string;
  description: string;
  protocol: QQProtocol;
  port: number;
  intervalTime: number | undefined;
  isSendDebugMessage: boolean;
}

// 初始化消息v2
export interface InitMessageV2 extends BaseInitMessage {
  version: 'init-v2';
  cookieString: string;
}

// 初始化消息
export interface InitMessage extends BaseInitMessage {
  executablePath: string;
  cookie: Array<Cookie>;
}

export type MessageObject = CloseMessage | CookieMessage | XBogusMessageData | InitMessageV2 | InitMessage;

// 判断各种类型
type IsMessageFunction<T extends MessageObject> = (d: MessageObject) => d is T;

export const isCloseMessage: IsMessageFunction<CloseMessage> = (d: MessageObject): d is CloseMessage => !!d['close'];
export const isCookieMessage: IsMessageFunction<CookieMessage> = (d: MessageObject): d is CookieMessage => d['type'] === 'cookie';
export const isXBogusMessage: IsMessageFunction<XBogusMessageData> = (d: MessageObject): d is XBogusMessageData => d['type'] === 'X-Bogus';
export const isInitMessageV2: IsMessageFunction<InitMessageV2> = (d: MessageObject): d is InitMessageV2 => d['version'] === 'init-v2';