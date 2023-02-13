import type MiraiQQ from '../QQBotModals/MiraiQQ';
import type OicqQQ from '../QQBotModals/OicqQQ';
import type GoCQHttp from '../QQBotModals/GoCQHttp';

/* 判断是oicq */
export function isOicq(qq: MiraiQQ | OicqQQ | GoCQHttp): qq is OicqQQ {
  return qq.protocol === 'oicq';
}

/* 判断是go-cqhttp */
export function isGoCQHttp(qq: MiraiQQ | OicqQQ | GoCQHttp): qq is GoCQHttp {
  return qq.protocol === 'go-cqhttp';
}

/* 判断可以同时支持CQ */
export function isOicqOrGoCQHttp(qq: MiraiQQ | OicqQQ | GoCQHttp): qq is (OicqQQ | GoCQHttp) {
  return isOicq(qq) || isGoCQHttp(qq);
}