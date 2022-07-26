import QQ from '../QQ';
import OicqQQ from '../OicqQQ';

/* 判断是oicq */
export function isOicq(qq: QQ | OicqQQ): qq is OicqQQ {
  return qq.protocol === 'oicq';
}