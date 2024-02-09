import * as fse from 'fs-extra';
import * as dayjs from 'dayjs';
import type { ChannelInfo } from 'nim-web-sdk-ng/dist/QCHAT_BROWSER_SDK/QChatChannelServiceInterface';
import * as CQ from '../../parser/CQ';
import { mp4Source, source, source48CN } from '../../../../utils/snh48';
import type {
  CustomMessageAllV2,
  UserV2,
  ReplyInfo,
  FlipCardInfo,
  FlipCardAudioInfo,
  FlipCardVideoInfo,
  GIFT_TEXTMessageV2
} from '../../../qq.types';
import type { MemberInfo } from '../../../../commonTypes';

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
}: RoomMessageArgs): Array<string> {
  const sendGroup: Array<string> = [];     // 发送的数据
  const nickName: string = user?.nickName ?? ''; // 用户名
  const msgTime: string = dayjs(data.time).format('YYYY-MM-DD HH:mm:ss'); // 发送时间

  // 输出房间信息
  const channelInfoContent: string = channel?.[0]?.name ? `\n频道：${ channel?.[0]?.name }` : ''; // 频道信息
  const memberInfoContent: string = pocket48MemberInfo && memberInfo
    ? `${ channelInfoContent }\n房间：${ memberInfo.ownerName } 的口袋房间` : channelInfoContent;

  try {
    if (data.type === 'text') {
      // 普通信息
      sendGroup.push(
        `${ nickName }：${ data.body }
时间：${ msgTime }${ memberInfoContent }`
      );
    } else if (data.type === 'custom' && (data.attach.messageType === 'REPLY' || data.attach.messageType === 'GIFTREPLY')) {
      // 回复信息
      const replyInfo: ReplyInfo = data.attach.replyInfo ?? data.attach.giftReplyInfo;

      sendGroup.push(
        `${ replyInfo.replyName }：${ replyInfo.replyText }
${ nickName }：${ replyInfo.text }
时间：${ msgTime }${ memberInfoContent }`
      );
    } else if (data.type === 'image') {
      // 发送图片
      sendGroup.push(
        `${ nickName } 发送了一张图片：`,
        CQ.image(data.attach.url),
        `时间：${ msgTime }${ memberInfoContent }`
      );
    } else if (data.type === 'audio') {
      // 发送语音
      sendGroup.push(
        `${ nickName } 发送了一条语音：${ data.attach.url }
时间：${ msgTime }${ memberInfoContent }`
      );
    } else if (data.type === 'video') {
      // 发送短视频
      sendGroup.push(
        `${ nickName } 发送了一个视频：${ data.attach.url }
时间：${ msgTime }${ memberInfoContent }`
      );
    } else if (data.type === 'custom' && data.attach.messageType === 'AUDIO') {
      // 发送语音_1
      sendGroup.push(
        `${ nickName } 发送了一条语音：${ data.attach.audioInfo.url }
时间：${ msgTime }${ memberInfoContent }`
      );
    } else if (data.type === 'custom' && data.attach.messageType === 'VIDEO') {
      // 发送短视频_1
      sendGroup.push(
        `${ nickName } 发送了一个视频：${ data.attach.videoInfo.url }
时间：${ msgTime }${ memberInfoContent }`
      );
    } else if (data.type === 'custom' && data.attach.messageType === 'LIVEPUSH') {
      // 直播
      if (pocket48LiveAtAll) {
        sendGroup.push(CQ.atAll());
      }

      sendGroup.push(
        `${ nickName } 正在直播
直播标题：${ data.attach.livePushInfo.liveTitle }
时间：${ msgTime }${ memberInfoContent }`,
        CQ.image(source48CN(data.attach.livePushInfo.liveCover))
      );
    } else if (data.type === 'custom' && data.attach.messageType === 'TEAM_VOICE') {
      // 房间电台
      if (pocket48LiveAtAll) {
        sendGroup.push(CQ.atAll());
      }

      sendGroup.push(
        `${ data.attach.voiceInfo.voiceStarInfoList?.[0]?.nickname ?? '' }开启了房间电台
地址：${ data.attach.voiceInfo.streamUrl }
时间：${ msgTime }${ memberInfoContent }`
      );
    } else if (data.type === 'custom' && data.attach.messageType === 'FLIPCARD') {
      // 鸡腿翻牌
      const info: FlipCardInfo = data.attach.filpCardInfo ?? data.attach.flipCardInfo;

      sendGroup.push(
        `${ nickName } 翻牌了问题：
${ info.question }
回答：${ info.answer }
时间：${ msgTime }${ memberInfoContent }`
      );
    } else if (
      data.type === 'custom'
      && (data.attach.messageType === 'FLIPCARD_AUDIO'
      || data.attach.messageType === 'FLIPCARD_VIDEO')
    ) {
      // 语音、视频翻牌
      const info: FlipCardAudioInfo | FlipCardVideoInfo = (data.attach.filpCardInfo ?? data.attach.flipCardInfo)
        ?? (data.attach.messageType === 'FLIPCARD_AUDIO'
          ? (data.attach.filpCardAudioInfo ?? data.attach.flipCardAudioInfo)
          : (data.attach.filpCardVideoInfo ?? data.attach.flipCardVideoInfo)
        );
      const answer: { url: string } = JSON.parse(info.answer);

      sendGroup.push(
        `${ nickName } 翻牌了问题：
${ info.question }
回答：${ mp4Source(answer.url) }
时间：${ msgTime }${ memberInfoContent }`
      );
    } else if (data.type === 'custom' && data.attach.messageType === 'EXPRESSIMAGE') {
      // 发送2021表情包
      sendGroup.push(
        `${ nickName } ：`,
        CQ.image(source(data.attach?.expressImageInfo?.emotionRemote
          ?? data.attach?.expressImgInfo?.emotionRemote
          ?? data.attach.emotionRemote)),
        `时间：${ msgTime }${ memberInfoContent }`
      );
    } else if (data.type === 'custom' && data.attach.messageType === 'PRESENT_TEXT') {
      // 投票
      // 判断是否为总选投票
      if (data.attach.giftInfo.giftName.includes('投票')) {
        sendGroup.push(
          `${ nickName }：投出了${ data.attach.giftInfo.giftNum }票。`,
          CQ.image(source48CN(data.attach.giftInfo.picPath)),
          `时间：${ msgTime }${ memberInfoContent }`
        );
      }
    } else if (data.type === 'custom' && data.attach.messageType === 'VOTE') {
      // 房间发起投票
      sendGroup.push(
        `${ nickName }：发起投票
标题：${ data.attach.voteInfo.text }
正文：${ data.attach.voteInfo.content }
时间：${ msgTime }${ memberInfoContent }`
      );
    } else if (data.type === 'custom' && data.attach.messageType === 'CLOSE_ROOM_CHAT') {
      // 关闭房间
      sendGroup.push(
        `${ nickName } 房间被关闭了。
时间：${ msgTime }${ memberInfoContent }`
      );
    } else if (data.type === 'custom' && data.attach.messageType === 'EXPRESS') {
      // 发表情
      sendGroup.push(
        `${ nickName }：发送了一个表情。
时间：${ msgTime }${ memberInfoContent }`
      );
    } else if (data.type === 'custom' && data.attach.messageType === 'GIFT_TEXT') {
      // 礼物信息
      const {
        acceptUserName,
        userName,
        giftName,
        giftNum,
        tpNum
      }: GIFT_TEXTMessageV2['attach']['giftInfo'] = data.attach.giftInfo;
      const tpNum1: number = Number(tpNum);

      sendGroup.push(
        `${ nickName } 送给 ${ acceptUserName ?? userName } ${ giftNum }个${ giftName }${ tpNum1 > 0 ? `(${ tpNum })` : '' }。
时间：${ msgTime }${ memberInfoContent }`
      );
    } else if (data.type === 'custom' && data.attach.messageType === 'RED_PACKET_2024') {
      // 红包
      sendGroup.push(
        `${ data.attach.creatorName || nickName } 发送了红包：`,
        CQ.image(data.attach.coverUrl),
        `时间：${ msgTime }${ memberInfoContent }`
      );
    } else if (data.type === 'custom' && [
      'DELETE',
      'SESSION_DIANTAI',
      'DISABLE_SPEAK',
      'OPEN_LIVE',
      'TRIP_INFO',
      'ZHONGQIU_ACTIVITY_LANTERN_FANS',
      'PERSONAL_VOICE'
    ].includes(data.attach.messageType)) {
      // 删除回复、禁言、open live、trip info
      // TODO: SESSION_DIANTA目前会导致重复发送信息，所以暂时不处理
      // 什么都不做
    } else {
      // 未知信息类型
      if (!(pocket48ShieldMsgType && pocket48ShieldMsgType.includes('UNKNOWN'))) {
        sendGroup.push(
          `${ nickName }：未知信息类型，请联系开发者。
数据：${ JSON.stringify(data) }
时间：${ msgTime }${ memberInfoContent }`
        );
      }
    }
  } catch (err) {
    console.error(err);

    if (!(pocket48ShieldMsgType && pocket48ShieldMsgType.includes('ERROR'))) {
      sendGroup.push(
        `信息发送错误，请联系开发者。
数据：${ JSON.stringify(data) }
时间：${ msgTime }${ memberInfoContent }`
      );
    }
  }

  return sendGroup;
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
    if (data.type === 'text') {
      // 普通信息
      logData = `${ nickName }：${ data.body }
时间：${ msgTime }${ memberInfoContent }`;
    } else if (data.type === 'custom' && data.attach.messageType === 'REPLY') {
      // 回复信息
      logData = `${ data.attach.replyInfo.replyName }：${ data.attach.replyInfo.replyText }
${ nickName }：${ data.attach.replyInfo.text }
时间：${ msgTime }${ memberInfoContent }`;
    } else if (data.type === 'image') {
      // 发送图片
      logData = `${ nickName } 发送了一张图片：
地址：${ data.attach.url }
时间：${ msgTime }${ memberInfoContent }`;
    } else if (data.type === 'audio') {
      // 发送语音
      logData = `${ nickName } 发送了一条语音：
地址：${ data.attach.url }
时间：${ msgTime }${ memberInfoContent }`;
    } else if (data.type === 'video') {
      // 发送短视频
      logData = `${ nickName } 发送了一个视频：
地址：${ data.attach.url }
时间：${ msgTime }${ memberInfoContent }`;
    } else if (data.type === 'custom' && data.attach.messageType === 'AUDIO') {
      // 发送语音_1
      logData = `${ nickName } 发送了一条语音：
地址：${ data.attach.audioInfo.url }
时间：${ msgTime }${ memberInfoContent }`;
    } else if (data.type === 'custom' && data.attach.messageType === 'VIDEO') {
      // 发送短视频_1
      logData = `${ nickName } 发送了一个视频：
地址：${ data.attach.videoInfo.url }
时间：${ msgTime }${ memberInfoContent }`;
    } else if (data.type === 'custom' && data.attach.messageType === 'LIVEPUSH') {
      // 直播
      logData = `${ nickName } 正在直播
直播标题：${ data.attach.livePushInfo.liveTitle }
时间：${ msgTime }${ memberInfoContent }`;
    } else if (data.type === 'custom' && data.attach.messageType === 'TEAM_VOICE') {
      // 房间电台
      logData = `${ data.attach.voiceInfo.voiceStarInfoList?.[0]?.nickname ?? '' } 开启了房间电台
地址：${ data.attach.voiceInfo.streamUrl }
时间：${ msgTime }${ memberInfoContent }`;
    } else if (data.type === 'custom' && data.attach.messageType === 'FLIPCARD') {
      // 鸡腿翻牌
      const info: FlipCardInfo = data.attach.filpCardInfo ?? data.attach.flipCardInfo;

      logData = `${ nickName } 翻牌了问题：
${ info.question }
回答：${ info.answer }
时间：${ msgTime }${ memberInfoContent }`;
    } else if (
      data.type === 'custom'
      && (data.attach.messageType === 'FLIPCARD_AUDIO'
      || data.attach.messageType === 'FLIPCARD_VIDEO')
    ) {
      // 语音、视频翻牌
      const info: FlipCardAudioInfo | FlipCardVideoInfo = (data.attach.filpCardInfo ?? data.attach.flipCardInfo)
        ?? (data.attach.messageType === 'FLIPCARD_AUDIO'
          ? (data.attach.filpCardAudioInfo ?? data.attach.flipCardAudioInfo)
          : (data.attach.filpCardVideoInfo ?? data.attach.flipCardVideoInfo)
        );
      const answer: { url: string } = JSON.parse(info.answer);

      logData = `${ nickName } 翻牌了问题：
${ info.question }
回答：${ mp4Source(answer.url) }
时间：${ msgTime }${ memberInfoContent }`;
    } else if (data.type === 'custom' && data.attach.messageType === 'EXPRESSIMAGE') {
      // 发送2021表情包
      logData = `${ nickName } 发送了一个表情：
地址：${ source(data.attach?.expressImageInfo?.emotionRemote
  ?? data.attach?.expressImgInfo?.emotionRemote
  ?? data.attach.emotionRemote) }
时间：${ msgTime }${ memberInfoContent }`;
    } else if (data.type === 'custom' && data.attach.messageType === 'PRESENT_TEXT') {
      // 投票
      // 判断是否为总选投票
      if (data.attach.giftInfo.giftName.includes('投票')) {
        logData = `${ nickName }：投出了${ data.attach.giftInfo.giftNum }票。
时间：${ msgTime }${ memberInfoContent }`;
      }
    } else if (data.type === 'custom' && data.attach.messageType === 'VOTE') {
      // 房间发起投票
      logData = `${ nickName }：发起投票
标题：${ data.attach.voteInfo.text }
正文：${ data.attach.voteInfo.content }
时间：${ msgTime }${ memberInfoContent }`;
    } else if (data.type === 'custom' && data.attach.messageType === 'CLOSE_ROOM_CHAT') {
      // 关闭房间
      logData = `${ nickName } 房间被关闭了。
时间：${ msgTime }${ memberInfoContent }`;
    } else if (data.type === 'custom' && data.attach.messageType === 'EXPRESS') {
      // 发表情
      logData = `${ nickName } 发送了一个表情：
${ JSON.stringify(data) }`;
    } else if (data.type === 'custom' && data.attach.messageType === 'DELETE') {
      // 删除回复
      logData = `${ nickName } 删除信息
${ JSON.stringify(data) }`;
    } else if (data.type === 'custom' && data.attach.messageType === 'GIFT_TEXT') {
      // 礼物信息
      const {
        acceptUserName,
        userName,
        giftName,
        giftNum,
        picPath,
        tpNum
      }: GIFT_TEXTMessageV2['attach']['giftInfo'] = data.attach.giftInfo;
      const tpNum1: number = Number(tpNum);

      logData = `${ nickName } 送给 ${ acceptUserName ?? userName } ${ giftNum }个${ giftName }${ tpNum1 > 0 ? `(${ tpNum })` : '' }。
地址：${ source(picPath) }
时间：${ msgTime }${ memberInfoContent }`;
    } else if (data.type === 'custom' && data.attach.messageType === 'RED_PACKET_2024') {
      logData = `${ data.attach.creatorName || nickName } 发送了红包。
封面地址：${ data.attach.coverUrl }`;
    } else if (data.type === 'custom' && [
      'SESSION_DIANTAI',
      'OPEN_LIVE',
      'TRIP_INFO',
      'ZHONGQIU_ACTIVITY_LANTERN_FANS'
    ].includes(data.attach.messageType)) {
      // 禁言、open live、trip info
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