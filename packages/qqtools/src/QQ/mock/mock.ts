import parser from '../parser/index';
import * as CQ from '../parser/CQ';
import { getRoomMessage, type RoomMessageArgs } from '../utils/pocket48V2Utils';
import { QQProtocol, type QQModals } from '../QQBotModals/ModalTypes';
import { getDouyinServerPort } from '../../utils/douyinServer/douyinServer';
import type { UserV2 } from '../qq.types';

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
      const zhouxiangPocketMockData: { message: any } = await import('../mock/zhouxiang.json', {
        assert: { type: 'json' }
      });

      for (const msg of zhouxiangPocketMockData.message) {
        const user: UserV2 = JSON.parse(msg.ext).user ;
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
  }
}

export default mock;