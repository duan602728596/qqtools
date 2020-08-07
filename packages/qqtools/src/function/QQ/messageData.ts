import type { Plain, Image, At, AtAll } from './types';

/**
 * 发送文字
 * @param { string } text: 文字
 */
export function plain(text: string): Plain {
  return { type: 'Plain', text };
}

/**
 * 发送图片
 * @param { string } url: 图片地址
 */
export function image(url: string): Image {
  return { type: 'Image', url };
}

/**
 * 圈人
 * @param { number } target: QQ号
 */
export function at(target: number): At {
  return {
    type: 'At',
    target,
    display: 'name'
  };
}

/**
 * 圈所有成员
 */
export function atAll(): AtAll {
  return { type: 'AtAll', target: 0 };
}