import type { FeedNodeCard } from '@qqtools-api/xiaohongshu';
import type { QQProtocol } from '../../../../QQBotModals/ModalTypes';

// 小红书protocol
export enum XHSProtocol {
  ChromeDevtoolsProtocol = 'chrome-devtools-protocol',
  ElectronInjectServer = 'electron-inject-server'
}

// 关闭消息
export interface CloseMessage {
  close: true;
}

// 初始化消息
export interface BaseInitMessage {
  userId: string;
  cacheFile: string;
  protocol: QQProtocol;
  cookieString: string;
  port: number;
  signProtocol: XHSProtocol;
  description: string;
  isSendDebugMessage?: boolean;
}

// sign的计算
export interface SignMessage {
  type: 'sign';
  id: string;
  result: XHSProtocol;
}

// 转base64
export interface ImageToBase64Message {
  type: 'imageToBase64';
  id: string;
  result: string;
}

export type MessageObject = CloseMessage | BaseInitMessage | SignMessage | ImageToBase64Message;

// 判断各种类型
type IsMessageFunction<T extends MessageObject> = (d: MessageObject) => d is T;

export const isCloseMessage: IsMessageFunction<CloseMessage> = (d: MessageObject): d is CloseMessage => !!d['close'];

export const isSignMessage: IsMessageFunction<SignMessage> = (d: MessageObject): d is SignMessage => d['type'] === 'sign';

export const isImageToBase64Message: IsMessageFunction<ImageToBase64Message>
  = (d: MessageObject): d is ImageToBase64Message => d['type'] === 'imageToBase64';

// 组合数据
export interface MergeData {
  noteId: string;
  cover: {
    url: string;
  };
  type: string;
  card?: FeedNodeCard;
}

// json缓存
export interface JsonCache {
  cache: Record<string, FeedNodeCard>;
}