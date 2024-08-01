import type MiraiQQ from './MiraiQQ';
import type GoCQHttp from './GoCQHttp';
import type ConsoleTest from './ConsoleTest';

/* 支持的qq机器人类型 */
export const enum QQProtocol {
  Mirai = 'mirai',
  GoCQHttp = 'go-cqhttp',
  ConsoleTest = 'console-test'
}

export type QQModals = MiraiQQ | GoCQHttp | ConsoleTest;