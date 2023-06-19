import type { NIMChatroomMessage } from '@yxim/nim-web-sdk/dist/SDK/NIM_Web_Chatroom/NIMChatroomMessageInterface';
import parser from '../parser';
import * as CQ from '../parser/CQ';
import { getRoomMessage, type RoomMessageArgs } from '../expand/pocket48/pocket48V2Utils';
import { QQProtocol, type QQModals } from '../../QQBotModals/ModalTypes';
import { getDouyinServerPort } from '../../../utils/proxyServer/proxyServer';
import {
  pocket48LiveRoomSendGiftText,
  pocket48LiveRoomSendGiftLeaderboardText,
  type GiftItem
} from '../expand/pocket48/giftCompute';
import { requestGiftList } from '../../services/pocket48/pocket48';
import type { UserV2, LiveRoomGiftInfoCustom } from '../../qq.types';
import type { GiftMoney, GiftMoneyGroup, GiftMoneyItem } from '../../services/interface';

const mockImg: string[] = [
  'https://wx2.sinaimg.cn/mw690/00689qXxly1hat3deahenj32c0340kjn.jpg',
  'https://wx4.sinaimg.cn/mw690/00689qXxly1hat3cvbbpgj325e2w7qv7.jpg'
];
const wav: string = 'https://nim-nosdn.netease.im/NDA5MzEwOA==/bmltYV80NjQxMTg5MjM2Nl8xNjc2MDEyNjkwMzc5XzA5MGQzMDY1LWMyM2ItNDBjZC1hYWRkLWI5ZmNmMGZkYzcxYQ==';

export interface MockFunc {
  (qq: QQModals, command: string, qqNumber: number, groupId: number): Promise<void>;
}

export interface DynamicMockFunc {
  default: MockFunc;
}

/* 根据命令发送mock数据，用于测试 */
async function mock(qq: QQModals, command: string, qqNumber: number, groupId: number): Promise<void> {
  switch (command) {
    case 'test-msg-ej':
      const img: string = CQ.image(
        qq.protocol === QQProtocol.Mirai
          ? mockImg[0]
          : `http://localhost:${ getDouyinServerPort().port }/proxy/weibo/image?url=${ encodeURIComponent(mockImg[0]) }`
      );

      await qq.sendMessage(parser(
        `恩瑾${ img }<%= qqtools:image, ${ mockImg[1] } %>[mirai:at:${ qqNumber }]\n恩瑾`,
        qq.protocol) as any, groupId);
      break;

    case 'test-voice-gxy':
      await qq.sendMessage(parser(CQ.record(wav), qq.protocol) as any, groupId);
      break;

    case 'test-pocket-zx':
      const zhouxiangPocketMockData: { message: any } = await import('./zhouxiang.json', {
        assert: { type: 'json' }
      });

      for (const msg of zhouxiangPocketMockData.message) {
        const user: UserV2 = JSON.parse(msg.ext).user;
        const roomMessageArgs: RoomMessageArgs = {
          user,
          data: msg,
          pocket48ShieldMsgType: undefined,
          channel: undefined
        };
        const sendGroup: string[] = getRoomMessage(roomMessageArgs);

        if (sendGroup.length > 0) {
          await qq.sendMessage(parser(sendGroup.join(''), qq.protocol) as any);
        }
      }

      break;

    case 'test-pocket-lyx':
      const linyixiPocketMockData2: { message: any } = await import('./linyixi.json', {
        assert: { type: 'json' }
      });

      for (const msg of linyixiPocketMockData2.message) {
        const user: UserV2 = msg.attach.voiceInfo.voiceStarInfoList[0];
        const roomMessageArgs: RoomMessageArgs = {
          user,
          data: msg,
          pocket48ShieldMsgType: undefined,
          channel: undefined
        };
        const sendGroup: string[] = getRoomMessage(roomMessageArgs);

        if (sendGroup.length > 0) {
          await qq.sendMessage(parser(sendGroup.join(''), qq.protocol) as any);
        }
      }

      break;

    case 'test-zzx':
      const zzxMockData: { user: any; data: any } = await import('./zhengzhaoxuan.json', {
        assert: { type: 'json' }
      });
      const resGift: GiftMoney = await requestGiftList(zzxMockData.user.userId);
      const giftMoneyList: Array<GiftMoneyItem> = resGift.content.map((o: GiftMoneyGroup) => o.giftList).flat();

      const qingchunshikeGiftList: Array<GiftItem> = [], giftList: Array<GiftItem> = [];

      zzxMockData.data.forEach((o: NIMChatroomMessage): void => {
        const customJson: LiveRoomGiftInfoCustom = JSON.parse(o.custom!);
        const giftInfo: GiftItem = {
          giftId: customJson.giftInfo.giftId,
          giftName: customJson.giftInfo.giftName,
          giftNum: customJson.giftInfo.giftNum,
          nickName: customJson.user.nickName,
          userId: customJson.user.userId
        };

        if (/^\d+(.\d+)?分$/.test(customJson.giftInfo.giftName)) {
          qingchunshikeGiftList.push(giftInfo);
        } else {
          giftList.push(giftInfo);
        }
      });

      const text: string | null = pocket48LiveRoomSendGiftText({
        qingchunshikeGiftList,
        giftList,
        giftMoneyList,
        giftNickName: zzxMockData.user.nickName
      });

      text && (await qq.sendMessage(parser(text, qq.protocol) as any));

      const text2: string = pocket48LiveRoomSendGiftLeaderboardText({
        qingchunshikeGiftList,
        giftList,
        giftMoneyList,
        giftNickName: zzxMockData.user.nickName
      });

      await qq.sendMessage(parser(text2, qq.protocol) as any);
  }
}

export default mock;