import MiraiQQ from '../QQBotModals/MiraiQQ';
import OicqQQ from '../QQBotModals/OicqQQ';

/* 判断是oicq */
export function isOicq(qq: MiraiQQ | OicqQQ): qq is OicqQQ {
  return qq.protocol === 'oicq';
}