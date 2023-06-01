import type { QQProtocol } from '../../../../QQBotModals/ModalTypes';
import type { FeedNodeCard } from '../../../../services/interface';

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

export type MessageObject = CloseMessage | BaseInitMessage;

// 判断各种类型
type IsMessageFunction<T extends MessageObject> = (d: MessageObject) => d is T;

export const isCloseMessage: IsMessageFunction<CloseMessage> = (d: MessageObject): d is CloseMessage => !!d['close'];

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