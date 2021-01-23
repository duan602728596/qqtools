import * as moment from 'moment';
import { plain, image, atAll } from './miraiUtils';
import type { CustomMessageAll, MessageChain, NIMMessage } from '../qq.types';

/**
 * 获取房间数据
 * @param { CustomMessageAll } customInfo: 消息对象
 * @param { NIMMessage } data: 发送消息
 * @param { boolean } pocket48LiveAtAll: 直播时是否at全体成员
 * @param { Array<NIMMessage> } event: 原始信息
 * @param { Array<string> | undefined } pocket48ShieldMsgType: 屏蔽类型
 */
export function getRoomMessage({ customInfo, data, pocket48LiveAtAll, event, pocket48ShieldMsgType }: {
  customInfo: CustomMessageAll;
  data: NIMMessage;
  pocket48LiveAtAll?: boolean;
  event: Array<NIMMessage>;
  pocket48ShieldMsgType: Array<string> | undefined;
}): Array<MessageChain> {
  const sendGroup: Array<MessageChain> = [];                 // 发送的数据
  const nickName: string = customInfo?.user?.nickName ?? ''; // 用户名
  const msgTime: string = moment(data.time).format('YYYY-MM-DD HH:mm:ss'); // 发送时间

  try {
    // 普通信息
    if (customInfo.messageType === 'TEXT') {
      sendGroup.push(
        plain(`${ nickName }：${ customInfo.text }
时间：${ msgTime }`)
      );
    } else

    // 回复信息
    if (customInfo.messageType === 'REPLY') {
      sendGroup.push(
        plain(`${ customInfo.replyName }：${ customInfo.replyText }
${ nickName }：${ customInfo.text }
时间：${ msgTime }`)
      );
    } else

    // 发送图片
    if (customInfo.messageType === 'IMAGE') {
      sendGroup.push(
        plain(`${ nickName } 发送了一张图片：`),
        image(data.file.url),
        plain(`时间：${ msgTime }`)
      );
    } else

    // 发送语音
    if (customInfo.messageType === 'AUDIO') {
      sendGroup.push(
        plain(`${ nickName } 发送了一条语音：${ data.file.url }
时间：${ msgTime }`)
      );
    } else

    // 发送短视频
    if (customInfo.messageType === 'VIDEO') {
      sendGroup.push(
        plain(`${ nickName } 发送了一个视频：${ data.file.url }
时间：${ msgTime }`)
      );
    } else

    // 直播
    if (customInfo.messageType === 'LIVEPUSH') {
      if (pocket48LiveAtAll) {
        sendGroup.push(atAll());
      }

      sendGroup.push(
        plain(`${ nickName } 正在直播
直播标题：${ customInfo.liveTitle }
时间：${ msgTime }`)
      );
    } else

    // 鸡腿翻牌
    if (customInfo.messageType === 'FLIPCARD') {
      sendGroup.push(
        plain(`${ nickName } 翻牌了问题：
${ customInfo.question }
回答：${ customInfo.answer }
时间：${ msgTime }`)
      );
    } else

    // 发表情
    if (customInfo.messageType === 'EXPRESS') {
      sendGroup.push(
        plain(`${ nickName }：发送了一个表情。
时间：${ msgTime }`)
      );
    } else

    // 删除回复、禁言、open live、trip info
    if (['DELETE', 'DISABLE_SPEAK', 'OPEN_LIVE', 'TRIP_INFO'].includes(customInfo.messageType)) {
      // 什么都不做
    } else {
      // 未知信息类型
      sendGroup.push(
        plain(`${ nickName }：未知信息类型，请联系开发者。
数据：${ JSON.stringify(event) }
时间：${ msgTime }`)
      );
    }
  } catch (err) {
    console.error(err);

    if (!(pocket48ShieldMsgType && pocket48ShieldMsgType.includes('ERROR'))) {
      sendGroup.push(
        plain(`信息发送错误，请联系开发者。
数据：${ JSON.stringify(event) }
时间：${ msgTime }`)
      );
    }
  }

  return sendGroup;
}

/* 随机id */
export function randomId(len: number = 10): string {
  const keys: string = '1234567890-_qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM';
  const keysLen: number = keys.length;
  let result: string = '';

  for (let i: number = 0; i < len; i++) {
    result += keys[Math.floor(Math.random() * keysLen)];
  }

  return result;
}