import { QQProtocol, type QQModals } from '../QQBotModals/ModalTypes';
import type OicqQQ from '../QQBotModals/OicqQQ';
import type GoCQHttp from '../QQBotModals/GoCQHttp';

/* 判断是oicq */
export function isOicq(qq: QQModals): qq is OicqQQ {
  return qq.protocol === QQProtocol.Oicq;
}

/* 判断是go-cqhttp */
export function isGoCQHttp(qq: QQModals): qq is GoCQHttp {
  return qq.protocol === QQProtocol.GoCQHttp;
}

/* 判断可以同时支持CQ */
export function isOicqOrGoCQHttp(qq: QQModals): qq is (OicqQQ | GoCQHttp) {
  return isOicq(qq) || isGoCQHttp(qq);
}