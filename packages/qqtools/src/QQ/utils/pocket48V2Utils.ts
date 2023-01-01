import * as dayjs from 'dayjs';
import type { MessageElem } from 'oicq';
import type { ChannelInfo } from 'nim-web-sdk-ng/dist/QCHAT_BROWSER_SDK/QChatChannelServiceInterface';
import { plain, image, atAll } from './miraiUtils';
import { miraiMessageTooicqMessage } from './oicqUtils';
import type {
  CustomMessageAllV2,
  UserV2,
  ReplyInfo,
  FlipCardInfo,
  FlipCardAudioInfo,
  FlipCardVideoInfo,
  MessageChain
} from '../qq.types';
import type { MemberInfo } from '../../commonTypes';

export interface RoomMessageArgs {
  user: UserV2 | undefined;
  data: CustomMessageAllV2;
  pocket48LiveAtAll?: boolean;
  pocket48ShieldMsgType: Array<string> | undefined;
  memberInfo?: MemberInfo;
  pocket48MemberInfo?: boolean;
  channel: Array<ChannelInfo> | undefined;
}

/**
 * 获取房间数据
 * @param { UserV2 | undefined } user: 消息对象
 * @param { CustomMessageAllV2 } data: 发送消息
 * @param { boolean } pocket48LiveAtAll: 直播时是否at全体成员
 * @param { Array<string> | undefined } pocket48ShieldMsgType: 屏蔽类型
 * @param { MemberInfo } memberInfo: 房间信息
 * @param { boolean } pocket48MemberInfo: 发送房间信息
 * @param { Array<ChannelInfo> | undefined } channel: 频道
 */
export function getRoomMessage({
  user,
  data,
  pocket48LiveAtAll,
  pocket48ShieldMsgType,
  memberInfo,
  pocket48MemberInfo,
  channel
}: RoomMessageArgs): Array<MessageChain> {
  const sendGroup: Array<MessageChain> = [];     // 发送的数据
  const nickName: string = user?.nickName ?? ''; // 用户名
  const msgTime: string = dayjs(data.time).format('YYYY-MM-DD HH:mm:ss'); // 发送时间

  // 输出房间信息
  const channelInfoContent: string = channel?.[0]?.name ? `\n频道：${ channel?.[0]?.name }` : ''; // 频道信息
  const memberInfoContent: string = pocket48MemberInfo && memberInfo
    ? `${ channelInfoContent }\n房间：${ memberInfo.ownerName } 的口袋房间` : channelInfoContent;

  try {
    // 普通信息
    if (data.type === 'text') {
      sendGroup.push(
        plain(`${ nickName }：${ data.body }
时间：${ msgTime }${ memberInfoContent }`)
      );
    } else

    // 回复信息
    if (data.type === 'custom' && (data.attach.messageType === 'REPLY' || data.attach.messageType === 'GIFTREPLY')) {
      const replyInfo: ReplyInfo = data.attach.replyInfo ?? data.attach.giftReplyInfo;

      sendGroup.push(
        plain(`${ replyInfo.replyName }：${ replyInfo.replyText }
${ nickName }：${ replyInfo.text }
时间：${ msgTime }${ memberInfoContent }`)
      );
    } else

    // 发送图片
    if (data.type === 'image') {
      sendGroup.push(
        plain(`${ nickName } 发送了一张图片：`),
        image(data.attach.url),
        plain(`时间：${ msgTime }${ memberInfoContent }`)
      );
    } else

    // 发送语音
    if (data.type === 'audio') {
      sendGroup.push(
        plain(`${ nickName } 发送了一条语音：${ data.attach.url }
时间：${ msgTime }${ memberInfoContent }`)
      );
    } else

    // 发送短视频
    if (data.type === 'video') {
      sendGroup.push(
        plain(`${ nickName } 发送了一个视频：${ data.attach.url }
时间：${ msgTime }${ memberInfoContent }`)
      );
    } else

    // 发送语音_1
    if (data.type === 'custom' && data.attach.messageType === 'AUDIO') {
      sendGroup.push(
        plain(`${ nickName } 发送了一条语音：${ data.attach.audioInfo.url }
时间：${ msgTime }${ memberInfoContent }`)
      );
    } else

    // 发送短视频_1
    if (data.type === 'custom' && data.attach.messageType === 'VIDEO') {
      sendGroup.push(
        plain(`${ nickName } 发送了一条语音：${ data.attach.videoInfo.url }
时间：${ msgTime }${ memberInfoContent }`)
      );
    } else

    // 直播
    if (data.type === 'custom' && data.attach.messageType === 'LIVEPUSH') {
      if (pocket48LiveAtAll) {
        sendGroup.push(atAll());
      }

      sendGroup.push(
        plain(`${ nickName } 正在直播
直播标题：${ data.attach.livePushInfo.liveTitle }
时间：${ msgTime }${ memberInfoContent }`)
      );
    } else

    // 鸡腿翻牌
    if (data.type === 'custom' && data.attach.messageType === 'FLIPCARD') {
      const info: FlipCardInfo = data.attach.filpCardInfo ?? data.attach.flipCardInfo;

      sendGroup.push(
        plain(`${ nickName } 翻牌了问题：
${ info.question }
回答：${ info.answer }
时间：${ msgTime }${ memberInfoContent }`)
      );
    } else

    // 语音、视频翻牌
    if (
      data.type === 'custom'
      && (data.attach.messageType === 'FLIPCARD_AUDIO'
      || data.attach.messageType === 'FLIPCARD_VIDEO')
    ) {
      const info: FlipCardAudioInfo | FlipCardVideoInfo = (data.attach.filpCardInfo ?? data.attach.flipCardInfo)
        ?? (data.attach.messageType === 'FLIPCARD_AUDIO'
          ? (data.attach.filpCardAudioInfo ?? data.attach.flipCardAudioInfo)
          : (data.attach.filpCardVideoInfo ?? data.attach.flipCardVideoInfo)
        );
      const answer: { url: string } = JSON.parse(info.answer);

      sendGroup.push(
        plain(`${ nickName } 翻牌了问题：
${ info.question }
回答：https://mp4.48.cn${ answer.url }
时间：${ msgTime }${ memberInfoContent }`)
      );
    } else

    // 发送2021表情包
    if (data.type === 'custom' && data.attach.messageType === 'EXPRESSIMAGE') {
      sendGroup.push(
        plain(`${ nickName } ：`),
        image(data.attach?.expressImageInfo?.emotionRemote ?? data.attach.emotionRemote),
        plain(`时间：${ msgTime }${ memberInfoContent }`)
      );
    } else

    // 投票
    if (data.type === 'custom' && data.attach.messageType === 'PRESENT_TEXT') {
      // 判断是否为总选投票
      if (data.attach.giftInfo.giftName.includes('投票')) {
        sendGroup.push(
          plain(`${ nickName }：投出了${ data.attach.giftInfo.giftNum }票。`),
          image(`https://source.48.cn${ data.attach.giftInfo.picPath }`),
          plain(`时间：${ msgTime }${ memberInfoContent }`)
        );
      }
    } else

    // 房间发起投票
    if (data.type === 'custom' && data.attach.messageType === 'VOTE') {
      sendGroup.push(
        plain(`${ nickName }：发起投票
标题：${ data.attach.voteInfo.text }
正文：${ data.attach.voteInfo.content }
时间：${ msgTime }${ memberInfoContent }`)
      );
    } else

    // 关闭房间
    if (data.type === 'custom' && data.attach.messageType === 'CLOSE_ROOM_CHAT') {
      sendGroup.push(
        plain(`${ nickName } 房间被关闭了。
时间：${ msgTime }${ memberInfoContent }`)
      );
    } else

    // 发表情
    if (data.type === 'custom' && data.attach.messageType === 'EXPRESS') {
      sendGroup.push(
        plain(`${ nickName }：发送了一个表情。
时间：${ msgTime }${ memberInfoContent }`)
      );
    } else

    // 删除回复、禁言、open live、trip info
    // TODO: SESSION_DIANTA目前会导致重复发送信息，所以暂时不处理
    if (data.type === 'custom' && [
      'DELETE',
      'SESSION_DIANTAI',
      'DISABLE_SPEAK',
      'OPEN_LIVE',
      'TRIP_INFO',
      'ZHONGQIU_ACTIVITY_LANTERN_FANS'
    ].includes(data.attach.messageType)) {
      // 什么都不做
    } else {
      // 未知信息类型
      if (!(pocket48ShieldMsgType && pocket48ShieldMsgType.includes('UNKNOWN'))) {
        sendGroup.push(
          plain(`${ nickName }：未知信息类型，请联系开发者。
数据：${ JSON.stringify(data) }
时间：${ msgTime }${ memberInfoContent }`)
        );
      }
    }
  } catch (err) {
    console.error(err);

    if (!(pocket48ShieldMsgType && pocket48ShieldMsgType.includes('ERROR'))) {
      sendGroup.push(
        plain(`信息发送错误，请联系开发者。
数据：${ JSON.stringify(data) }
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
 * @param { UserV2 | undefined } user: 消息对象
 * @param { CustomMessageAllV2 } data: 消息对象
 * @param { MemberInfo } memberInfo: 房间信息
 * @param { Array<ChannelInfo> | undefined } channel: 频道
 */
export function getLogMessage({ user, data, memberInfo, channel }: {
  user: UserV2 | undefined;
  data: CustomMessageAllV2;
  memberInfo?: MemberInfo;
  channel: Array<ChannelInfo> | undefined;
}): string | undefined {
  let logData: string | undefined; // 日志信息
  const nickName: string = user?.nickName ?? ''; // 用户名
  const msgTime: string = dayjs(data.time).format('YYYY-MM-DD HH:mm:ss'); // 发送时间

  // 输出房间信息
  const channelInfoContent: string = channel?.[0]?.name ? `\n频道：${ channel?.[0]?.name }` : ''; // 频道信息
  const memberInfoContent: string = memberInfo
    ? `${ channelInfoContent }\n房间：${ memberInfo.ownerName } 的口袋房间`
    : channelInfoContent;

  try {
    // 普通信息
    if (data.type === 'text') {
      logData = `${ nickName }：${ data.body }
时间：${ msgTime }${ memberInfoContent }`;
    } else

    // 回复信息
    if (data.type === 'custom' && data.attach.messageType === 'REPLY') {
      logData = `${ data.attach.replyInfo.replyName }：${ data.attach.replyInfo.replyText }
${ nickName }：${ data.attach.replyInfo.text }
时间：${ msgTime }${ memberInfoContent }`;
    } else

    // 发送图片
    if (data.type === 'image') {
      logData = `${ nickName } 发送了一张图片：
地址：${ data.attach.url }
时间：${ msgTime }${ memberInfoContent }`;
    } else

    // 发送语音
    if (data.type === 'audio') {
      logData = `${ nickName } 发送了一条语音：
地址：${ data.attach.url }
时间：${ msgTime }${ memberInfoContent }`;
    } else

    // 发送短视频
    if (data.type === 'video') {
      logData = `${ nickName } 发送了一个视频：
地址：${ data.attach.url }
时间：${ msgTime }${ memberInfoContent }`;
    } else

    // 发送语音_1
    if (data.type === 'custom' && data.attach.messageType === 'AUDIO') {
      logData = `${ nickName } 发送了一条语音：
地址：${ data.attach.audioInfo.url }
时间：${ msgTime }${ memberInfoContent }`;
    } else

    // 发送短视频_1
    if (data.type === 'custom' && data.attach.messageType === 'VIDEO') {
      logData = `${ nickName } 发送了一个视频：
地址：${ data.attach.videoInfo.url }
时间：${ msgTime }${ memberInfoContent }`;
    } else

    // 直播
    if (data.type === 'custom' && data.attach.messageType === 'LIVEPUSH') {
      logData = `${ nickName } 正在直播
直播标题：${ data.attach.livePushInfo.liveTitle }
时间：${ msgTime }${ memberInfoContent }`;
    } else

    // 鸡腿翻牌
    if (data.type === 'custom' && data.attach.messageType === 'FLIPCARD') {
      const info: FlipCardInfo = data.attach.filpCardInfo ?? data.attach.flipCardInfo;

      logData = `${ nickName } 翻牌了问题：
${ info.question }
回答：${ info.answer }
时间：${ msgTime }${ memberInfoContent }`;
    } else

    // 语音、视频翻牌
    if (
      data.type === 'custom'
      && (data.attach.messageType === 'FLIPCARD_AUDIO'
      || data.attach.messageType === 'FLIPCARD_VIDEO')
    ) {
      const info: FlipCardAudioInfo | FlipCardVideoInfo = (data.attach.filpCardInfo ?? data.attach.flipCardInfo)
        ?? (data.attach.messageType === 'FLIPCARD_AUDIO'
          ? (data.attach.filpCardAudioInfo ?? data.attach.flipCardAudioInfo)
          : (data.attach.filpCardVideoInfo ?? data.attach.flipCardVideoInfo)
        );
      const answer: { url: string } = JSON.parse(info.answer);

      logData = `${ nickName } 翻牌了问题：
${ info.question }
回答：https://mp4.48.cn${ answer.url }
时间：${ msgTime }${ memberInfoContent }`;
    } else

    // 发送2021表情包
    if (data.type === 'custom' && data.attach.messageType === 'EXPRESSIMAGE') {
      logData = `${ nickName } 发送了一个表情：
地址：${ data.attach?.expressImageInfo?.emotionRemote ?? data.attach.emotionRemote }
时间：${ msgTime }${ memberInfoContent }`;
    } else

    // 投票
    if (data.type === 'custom' && data.attach.messageType === 'PRESENT_TEXT') {
      // 判断是否为总选投票
      if (data.attach.giftInfo.giftName.includes('投票')) {
        logData = `${ nickName }：投出了${ data.attach.giftInfo.giftNum }票。
时间：${ msgTime }${ memberInfoContent }`;
      }
    } else

    // 房间发起投票
    if (data.type === 'custom' && data.attach.messageType === 'VOTE') {
      logData = `${ nickName }：发起投票
标题：${ data.attach.voteInfo.text }
正文：${ data.attach.voteInfo.content }
时间：${ msgTime }${ memberInfoContent }`;
    } else

    // 关闭房间
    if (data.type === 'custom' && data.attach.messageType === 'CLOSE_ROOM_CHAT') {
      logData = `${ nickName } 房间被关闭了。
时间：${ msgTime }${ memberInfoContent }`;
    } else

    // 发表情
    if (data.type === 'custom' && data.attach.messageType === 'EXPRESS') {
      logData = `${ nickName } 发送了一个表情：
${ JSON.stringify(data) }`;
    } else

    // 删除回复
    if (data.type === 'custom' && data.attach.messageType === 'DELETE') {
      logData = `${ nickName } 删除信息
${ JSON.stringify(data) }`;
    } else

    // 禁言、open live、trip info
    if (data.type === 'custom' && [
      'SESSION_DIANTAI',
      'OPEN_LIVE',
      'TRIP_INFO',
      'ZHONGQIU_ACTIVITY_LANTERN_FANS'
    ].includes(data.attach.messageType)) {
      // 什么都不做
    } else {
      // 未知信息类型
      logData = `未知信息类型，请联系开发者。
${ JSON.stringify(data) }`;
    }
  } catch (err) {
    console.error(err);

    logData = `信息发送错误，请联系开发者。
${ JSON.stringify(data) }
时间：${ msgTime }${ memberInfoContent }`;
  }

  return logData;
}