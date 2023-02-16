import type MiraiQQ from './MiraiQQ';
import type OicqQQ from './OicqQQ';
import type GoCQHttp from './GoCQHttp';

/* 支持的qq机器人类型 */
export const enum QQProtocol {
  Mirai = 'mirai',
  Oicq = 'oicq',
  GoCQHttp = 'go-cqhttp'
}

export type QQModals = MiraiQQ | OicqQQ | GoCQHttp;