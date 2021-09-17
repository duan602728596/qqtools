import * as fse from 'fs-extra';
import * as dayjs from 'dayjs';
import type { MessageElem } from 'oicq';
import { plain, image, atAll } from './miraiUtils';
import { miraiMessageTooicqMessage } from './oicqUtils';
import type { CustomMessageAll, MessageChain, NIMMessage } from '../qq.types';
import type { MemberInfo } from '../../types';

export interface RoomMessageArgs {
  customInfo: CustomMessageAll;
  data: NIMMessage;
  pocket48LiveAtAll?: boolean;
  event: Array<NIMMessage>;
  pocket48ShieldMsgType: Array<string> | undefined;
  memberInfo?: MemberInfo;
  pocket48MemberInfo?: boolean;
}

/**
 * 获取房间数据
 * @param { CustomMessageAll } customInfo: 消息对象
 * @param { NIMMessage } data: 发送消息
 * @param { boolean } pocket48LiveAtAll: 直播时是否at全体成员
 * @param { Array<NIMMessage> } event: 原始信息
 * @param { Array<string> | undefined } pocket48ShieldMsgType: 屏蔽类型
 * @param { MemberInfo } memberInfo: 房间信息
 * @param { boolean } pocket48MemberInfo: 发送房间信息
 */
export function getRoomMessage({
  customInfo,
  data,
  pocket48LiveAtAll,
  event,
  pocket48ShieldMsgType,
  memberInfo,
  pocket48MemberInfo
}: RoomMessageArgs): Array<MessageChain> {
  const sendGroup: Array<MessageChain> = [];                 // 发送的数据
  const nickName: string = customInfo?.user?.nickName ?? ''; // 用户名
  const msgTime: string = dayjs(data.time).format('YYYY-MM-DD HH:mm:ss'); // 发送时间

  // 输出房间信息
  const memberInfoContent: string = pocket48MemberInfo && memberInfo
    ? `\n房间：${ memberInfo.ownerName } 的口袋房间` : '';

  try {
    // 普通信息
    if (customInfo.messageType === 'TEXT') {
      sendGroup.push(
        plain(`${ nickName }：${ customInfo.text }
时间：${ msgTime }${ memberInfoContent }`)
      );
    } else

    // 回复信息
    if (customInfo.messageType === 'REPLY' || customInfo.messageType === 'GIFTREPLY') {
      sendGroup.push(
        plain(`${ customInfo.replyName }：${ customInfo.replyText }
${ nickName }：${ customInfo.text }
时间：${ msgTime }${ memberInfoContent }`)
      );
    } else

    // 发送图片
    if (customInfo.messageType === 'IMAGE') {
      sendGroup.push(
        plain(`${ nickName } 发送了一张图片：`),
        image(data.file.url),
        plain(`时间：${ msgTime }${ memberInfoContent }`)
      );
    } else

    // 发送语音
    if (customInfo.messageType === 'AUDIO') {
      sendGroup.push(
        plain(`${ nickName } 发送了一条语音：${ data.file.url }
时间：${ msgTime }${ memberInfoContent }`)
      );
    } else

    // 发送短视频
    if (customInfo.messageType === 'VIDEO') {
      sendGroup.push(
        plain(`${ nickName } 发送了一个视频：${ data.file.url }
时间：${ msgTime }${ memberInfoContent }`)
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
时间：${ msgTime }${ memberInfoContent }`)
      );
    } else

    // 鸡腿翻牌
    if (customInfo.messageType === 'FLIPCARD') {
      sendGroup.push(
        plain(`${ nickName } 翻牌了问题：
${ customInfo.question }
回答：${ customInfo.answer }
时间：${ msgTime }${ memberInfoContent }`)
      );
    } else

    // 语音、视频翻牌
    if (customInfo.messageType === 'FLIPCARD_AUDIO' || customInfo.messageType === 'FLIPCARD_VIDEO') {
      const answer: { url: string } = JSON.parse(customInfo.answer);

      sendGroup.push(
        plain(`${ nickName } 翻牌了问题：
${ customInfo.question }
回答：https://mp4.48.cn${ answer.url }
时间：${ msgTime }${ memberInfoContent }`)
      );
    } else

    // 发送2021表情包
    if (customInfo.messageType === 'EXPRESSIMAGE') {
      sendGroup.push(
        plain(`${ nickName } ：`),
        image(customInfo.emotionRemote),
        plain(`时间：${ msgTime }${ memberInfoContent }`)
      );
    } else

    // 投票
    if (customInfo.messageType === 'PRESENT_TEXT') {
      // 判断是否为总选投票
      if (customInfo.giftInfo.giftName.includes('投票')) {
        sendGroup.push(
          plain(`${ nickName }：投出了${ customInfo.giftInfo.giftNum }票。`),
          image(`https://source.48.cn${ customInfo.giftInfo.picPath }`),
          plain(`时间：${ msgTime }${ memberInfoContent }`)
        );
      }
    } else

    // 关闭房间
    if (customInfo.messageType === 'CLOSE_ROOM_CHAT') {
      sendGroup.push(
        plain(`${ nickName } 房间被关闭了。：
时间：${ msgTime }${ memberInfoContent }`)
      );
    } else

    // 发表情
    if (customInfo.messageType === 'EXPRESS') {
      sendGroup.push(
        plain(`${ nickName }：发送了一个表情。
时间：${ msgTime }${ memberInfoContent }`)
      );
    } else

    // 删除回复、禁言、open live、trip info
    // TODO: SESSION_DIANTA目前会导致重复发送信息，所以暂时不处理
    if ([
      'DELETE',
      'SESSION_DIANTAI',
      'DISABLE_SPEAK',
      'OPEN_LIVE',
      'TRIP_INFO',
      'ZHONGQIU_ACTIVITY_LANTERN_FANS'
    ].includes(customInfo.messageType)) {
      // 什么都不做
    } else {
      // 未知信息类型
      if (!(pocket48ShieldMsgType && pocket48ShieldMsgType.includes('UNKNOWN'))) {
        sendGroup.push(
          plain(`${ nickName }：未知信息类型，请联系开发者。
数据：${ JSON.stringify(event) }
时间：${ msgTime }${ memberInfoContent }`)
        );
      }
    }
  } catch (err) {
    console.error(err);

    if (!(pocket48ShieldMsgType && pocket48ShieldMsgType.includes('ERROR'))) {
      sendGroup.push(
        plain(`信息发送错误，请联系开发者。
数据：${ JSON.stringify(event) }
时间：${ msgTime }${ memberInfoContent }`)
      );
    }
  }

  return sendGroup;
}

/**
 * 获取房间数据
 * @param { RoomMessageArgs } roomMessageArgs
 */
export function getRoomMessageForOicq(roomMessageArgs: RoomMessageArgs): Array<MessageElem> {
  const message: Array<MessageChain> = getRoomMessage(roomMessageArgs);

  return miraiMessageTooicqMessage(message);
}

/**
 * 获取房间日志
 * @param { CustomMessageAll } customInfo: 消息对象
 * @param { NIMMessage } data: 发送消息
 * @param { Array<NIMMessage> } event: 原始信息
 * @param { MemberInfo } memberInfo: 房间信息
 */
export function getLogMessage({ customInfo, data, event, memberInfo }: {
  customInfo: CustomMessageAll;
  data: NIMMessage;
  event: Array<NIMMessage>;
  memberInfo?: MemberInfo;
}): string | undefined {
  let logData: string | undefined; // 日志信息
  const nickName: string = customInfo?.user?.nickName ?? ''; // 用户名
  const msgTime: string = dayjs(data.time).format('YYYY-MM-DD HH:mm:ss'); // 发送时间

  // 输出房间信息
  const memberInfoContent: string = memberInfo ? `\n房间：${ memberInfo.ownerName } 的口袋房间` : '';

  try {
    // 普通信息
    if (customInfo.messageType === 'TEXT') {
      logData = `${ nickName }：${ customInfo.text }
时间：${ msgTime }${ memberInfoContent }`;
    } else

    // 回复信息
    if (customInfo.messageType === 'REPLY') {
      logData = `${ customInfo.replyName }：${ customInfo.replyText }
${ nickName }：${ customInfo.text }
时间：${ msgTime }${ memberInfoContent }`;
    } else

    // 发送图片
    if (customInfo.messageType === 'IMAGE') {
      logData = `${ nickName } 发送了一张图片：
地址：${ data.file.url }
时间：${ msgTime }${ memberInfoContent }`;
    } else

    // 发送语音
    if (customInfo.messageType === 'AUDIO') {
      logData = `${ nickName } 发送了一条语音：
地址：${ data.file.url }
时间：${ msgTime }${ memberInfoContent }`;
    } else

    // 发送短视频
    if (customInfo.messageType === 'VIDEO') {
      logData = `${ nickName } 发送了一个视频：
地址：${ data.file.url }
时间：${ msgTime }${ memberInfoContent }`;
    } else

    // 直播
    if (customInfo.messageType === 'LIVEPUSH') {
      logData = `${ nickName } 正在直播
直播标题：${ customInfo.liveTitle }
时间：${ msgTime }${ memberInfoContent }`;
    } else

    // 鸡腿翻牌
    if (customInfo.messageType === 'FLIPCARD') {
      logData = `${ nickName } 翻牌了问题：
${ customInfo.question }
回答：${ customInfo.answer }
时间：${ msgTime }${ memberInfoContent }`;
    } else

    // 语音、视频翻牌
    if (customInfo.messageType === 'FLIPCARD_AUDIO' || customInfo.messageType === 'FLIPCARD_VIDEO') {
      const answer: { url: string } = JSON.parse(customInfo.answer);

      logData = `${ nickName } 翻牌了问题：
${ customInfo.question }
回答：https://mp4.48.cn${ answer.url }
时间：${ msgTime }${ memberInfoContent }`;
    } else

    // 发送2021表情包
    if (customInfo.messageType === 'EXPRESSIMAGE') {
      logData = `${ nickName } 发送了一个表情：
地址：${ customInfo.emotionRemote }
时间：${ msgTime }${ memberInfoContent }`;
    } else

    // 投票
    if (customInfo.messageType === 'PRESENT_TEXT') {
      // 判断是否为总选投票
      if (customInfo.giftInfo.giftName.includes('投票')) {
        logData = `${ nickName }：投出了${ customInfo.giftInfo.giftNum }票。
时间：${ msgTime }${ memberInfoContent }`;
      }
    } else

    // 关闭房间
    if (customInfo.messageType === 'CLOSE_ROOM_CHAT') {
      logData = `${ nickName } 房间被关闭了。：
时间：${ msgTime }${ memberInfoContent }`;
    } else

    // 发表情
    if (customInfo.messageType === 'EXPRESS') {
      logData = `${ nickName } 发送了一个表情：
${ JSON.stringify(event) }`;
    } else

    // 删除回复
    if (customInfo.messageType === 'DELETE') {
      logData = `${ nickName } 删除信息
${ JSON.stringify(event) }`;
    } else

    // 禁言、open live、trip info
    if ([
      'SESSION_DIANTAI',
      'OPEN_LIVE',
      'TRIP_INFO',
      'ZHONGQIU_ACTIVITY_LANTERN_FANS'
    ].includes(customInfo.messageType)) {
      // 什么都不做
    } else {
      // 未知信息类型
      logData = `未知信息类型，请联系开发者。
${ JSON.stringify(event) }`;
    }
  } catch (err) {
    console.error(err);

    logData = `信息发送错误，请联系开发者。
${ JSON.stringify(event) }
时间：${ msgTime }${ memberInfoContent }`;
  }

  return logData;
}

/**
 * 输出日志
 * @param { string } dir: 日志输出目录
 * @param { string } logData: 日志内容
 */
export async function log(dir: string, logData: string): Promise<void> {
  const logDay: string = dayjs().format('YYYY-MM-DD');

  await fse.outputFile(`${ dir }/${ logDay }.log`, `${ logData }\n\n`, {
    encoding: 'utf8',
    flag: 'a'
  });
}