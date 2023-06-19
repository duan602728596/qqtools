import { randomUUID } from 'node:crypto';
import type { ChannelInfo } from 'nim-web-sdk-ng/dist/QCHAT_BROWSER_SDK/QChatChannelServiceInterface';
import type { NIMChatroomMessage } from '@yxim/nim-web-sdk/dist/SDK/NIM_Web_Chatroom/NIMChatroomMessageInterface';
import QChatSocket from '../../../sdk/QChatSocket';
import NimChatroomSocket from '../../../sdk/NimChatroomSocket';
import { qChatSocketList, nimChatroomList } from '../../../QQBotModals/Basic';
import { getRoomMessage, getLogMessage, log, type RoomMessageArgs } from './pocket48V2Utils';
import parser from '../../parser';
import { requestGiftList } from '../../../services/pocket48';
import { giftSend, giftLeaderboard, type GiftItem, type GiftSendItem, type GiftUserItem } from './giftCompute';
import type { QQModals } from '../../../QQBotModals/ModalTypes';
import type { OptionsItemPocket48V2, MemberInfo } from '../../../../commonTypes';
import type { CustomMessageAllV2, UserV2, LiveRoomGiftInfoCustom, LiveRoomLiveCloseCustom } from '../../../qq.types';
import type { GiftMoneyItem, GiftMoney } from '../../../services/interface';

/* 口袋48 */
class Pocket48V2Expand {
  static channelIdMap: Map<string, Array<ChannelInfo>> = new Map();

  public config: OptionsItemPocket48V2;
  public qq: QQModals;
  public qChatSocketId?: string;                  // 对应的nim的唯一socketId
  public qChatSocket?: QChatSocket;               // socket
  public nimChatroom?: NimChatroomSocket;         // 口袋48直播间
  public memberInfo?: MemberInfo;                 // 房间成员信息
  public giftList?: Array<GiftItem>;              // 礼物榜
  public qingchunshikeGiftList?: Array<GiftItem>; // 青春时刻
  public giftUserId?: number;
  public giftNickName?: string;

  constructor({ config, qq }: { config: OptionsItemPocket48V2; qq: QQModals }) {
    this.config = config;
    this.qq = qq;
  }

  // 处理单个消息
  async roomSocketMessage(event: CustomMessageAllV2): Promise<void> {
    const {
      pocket48LiveAtAll,
      pocket48ServerId,
      pocket48Account,
      pocket48Token,
      pocket48ShieldMsgType,
      pocket48MemberInfo,
      pocket48LogSave,
      pocket48LogDir,
      // 直播间相关
      pocket48LiveListener,
      pocket48LiveRoomId,
      pocket48LiveRoomSendGiftInfo,
      pocket48LiveRoomSendGiftLeaderboard
    }: OptionsItemPocket48V2 = this.config;

    if (event.serverId !== pocket48ServerId) return; // 频道不一致时不处理

    // 类型
    let type: string = event.type;

    if (type === 'custom' && ('attach' in event) && ('messageType' in event.attach)) {
      type = event.attach.messageType;
    } else {
      type = type.toUpperCase();
    }

    if (pocket48ShieldMsgType && pocket48ShieldMsgType.includes(type)) return; // 屏蔽信息类型

    // 用户
    const user: UserV2 | undefined = event.ext ? JSON.parse(event.ext).user : undefined;
    const isIdolUser: boolean = !!(user && user.roleId === 3 && !user.vip); // 判断是否是小偶像的信息
    const isPresentText: boolean = type === 'PRESENT_TEXT'; // 投票信息
    const isGiftText: boolean = type === 'GIFT_TEXT';       // 礼物信息
    const isTeamVoice: boolean = type === 'TEAM_VOICE';     // 房间电台

    // xox信息、礼物信息、房间电台可以处理
    if (isIdolUser || isPresentText || isGiftText || isTeamVoice) {
      let channel: Array<ChannelInfo> | undefined;

      if (Pocket48V2Expand.channelIdMap.has(event.channelId)) {
        channel = Pocket48V2Expand.channelIdMap.get(event.channelId);
      } else {
        const channelResult: Array<ChannelInfo> | undefined = await this.qChatSocket?.qChat!.qchatChannel.getChannels({
          channelIds: [event.channelId]
        });

        channelResult && Pocket48V2Expand.channelIdMap.set(event.channelId, channelResult);
        channel = channelResult;
      }

      if (channel?.[0]?.name === '直播') return; // 过滤直播房间

      // 发送的数据
      const roomMessageArgs: RoomMessageArgs = {
        user,
        data: event,
        pocket48LiveAtAll,
        pocket48ShieldMsgType,
        memberInfo: this.memberInfo,
        pocket48MemberInfo,
        channel
      };
      const sendGroup: string[] = getRoomMessage(roomMessageArgs);

      if (sendGroup.length > 0) {
        await this.qq.sendMessage(parser(sendGroup.join(''), this.qq.protocol) as any);
      }

      // 日志
      if (pocket48LogSave && pocket48LogDir && !/^\s*$/.test(pocket48LogDir)) {
        const logData: string | undefined = getLogMessage({
          user,
          data: event,
          memberInfo: this.memberInfo,
          channel
        });

        if (logData) {
          await log(pocket48LogDir, logData);
        }
      }

      // 直播统计
      if (
        pocket48LiveListener
        && pocket48LiveRoomId
        && (pocket48LiveRoomSendGiftInfo || pocket48LiveRoomSendGiftLeaderboard)
        && event.type === 'custom'
        && event.attach.messageType === 'LIVEPUSH'
        && this.qChatSocketId
      ) {
        this.giftList = [];
        this.qingchunshikeGiftList = [];
        this.giftUserId = user!.userId;
        this.giftNickName = user!.nickName;

        const index: number = nimChatroomList.findIndex(
          (o: NimChatroomSocket): boolean => o.pocket48RoomId === pocket48LiveRoomId);

        if (index < 0) {
          this.nimChatroom = new NimChatroomSocket({
            pocket48IsAnonymous: false,
            pocket48Account,
            pocket48Token
          });
          await this.nimChatroom.init();
          this.nimChatroom.addQueue({
            id: this.qChatSocketId,
            onmsgs: this.handleLiveRoomSocketMessage
          });
          nimChatroomList.push(this.nimChatroom); // 添加到列表
        } else {
          nimChatroomList[index].addQueue({
            id: this.qChatSocketId,
            onmsgs: this.handleLiveRoomSocketMessage
          });
          this.nimChatroom = nimChatroomList[index];
        }
      }
    }
  }

  // 循环处理所有消息
  async roomSocketMessageAll(event: CustomMessageAllV2): Promise<void> {
    try {
      await this.roomSocketMessage(event);
    } catch (err) {
      console.error(err);
    }
  }

  // 事件监听
  handleRoomSocketMessage: Function = (event: CustomMessageAllV2): void => {
    this.roomSocketMessageAll(event);
  };

  // 处理单个消息
  async liveRoomSocketMessageOne(msg: NIMChatroomMessage): Promise<void> {
    if (msg.type !== 'custom' || !msg.custom) return;

    const customJson: LiveRoomGiftInfoCustom | LiveRoomLiveCloseCustom = JSON.parse(msg.custom);
    const {
      pocket48LiveRoomSendGiftInfo,
      pocket48LiveRoomSendGiftLeaderboard
    }: OptionsItemPocket48V2 = this.config;

    // 礼物信息
    if ('giftInfo' in customJson) {
      const giftInfo: GiftItem = {
        giftId: customJson.giftInfo.giftId,
        giftName: customJson.giftInfo.giftName,
        giftNum: customJson.giftInfo.giftNum,
        nickName: customJson.user.nickName,
        userId: customJson.user.userId
      };

      if (/^\d+(.\d+)?分$/.test(giftInfo.giftName)) {
        this.qingchunshikeGiftList?.push?.(giftInfo);
      } else {
        this.giftList?.push?.(giftInfo);
      }
    } else if (customJson.messageType === 'CLOSELIVE') {
      const resGift: GiftMoney = await requestGiftList(this.giftUserId!);
      const giftMoneyList: Array<GiftMoneyItem> = [];

      for (const giftGroup of resGift.content) {
        giftMoneyList.push(...giftGroup.giftList);
      }

      // 计算礼物信息
      if (pocket48LiveRoomSendGiftInfo) {
        const [qingchunshikeGiftListResult, giftListResult]: [Array<GiftSendItem>, Array<GiftSendItem>]
          = [giftSend(this.qingchunshikeGiftList!, giftMoneyList), giftSend(this.giftList!, giftMoneyList)];

        if (qingchunshikeGiftListResult.length > 0 || giftListResult.length > 0) {
          let TotalCost: number = 0;
          const qingchunshikeGiftText: Array<string> = qingchunshikeGiftListResult.map((o: GiftSendItem) => {
            return `${ o.giftName }x${ o.giftNum }`;
          });
          const giftText: Array<string> = giftListResult.map((o: GiftSendItem) => {
            TotalCost += o.money * o.giftNum;

            return `${ o.giftName }x${ o.giftNum }`;
          });

          await this.qq.sendMessage(parser(`[${ this.giftNickName }]直播礼物统计：${ TotalCost }\n${
            [...qingchunshikeGiftText, giftText].join('\n')
          }`, this.qq.protocol) as any);
        }
      }

      // 计算单人的排行榜
      if (pocket48LiveRoomSendGiftLeaderboard) {
        const giftLeaderboardText: Array<string> = [`[${ this.giftNickName }]直播礼物排行榜：`];
        const giftLeaderboardResult: Array<GiftUserItem> = giftLeaderboard([...this.qingchunshikeGiftList!, ...this.giftList!], giftMoneyList);

        giftLeaderboardResult.forEach((item: GiftUserItem, index: number): void => {
          giftLeaderboardText.push(`${ index + 1 }、${ item.nickName }：${ item.total }`);

          for (const item2 of item.qingchunshikeGiftList) {
            giftLeaderboardText.push(`${ item2.giftName }x${ item2.giftNum }`);
          }

          for (const item2 of item.giftList) {
            giftLeaderboardText.push(`${ item2.giftName }x${ item2.giftNum }`);
          }
        });

        await this.qq.sendMessage(parser(giftLeaderboardText.join('\n'), this.qq.protocol) as any);
      }

      this.giftList = [];
      this.qingchunshikeGiftList = [];
    }
  }

  // 循环处理所有消息
  liveRoomSocketMessageAll(event: Array<NIMChatroomMessage>): void {
    for (const msg of event) {
      this.liveRoomSocketMessageOne(msg);
    }
  }

  // 直播间时间监听
  handleLiveRoomSocketMessage: Function = (event: Array<NIMChatroomMessage>): void => {
    this.liveRoomSocketMessageAll(event);
  };

  // 口袋48监听初始化
  async initPocket48(): Promise<void> {
    const {
      pocket48RoomListener,
      pocket48ServerId,
      pocket48Account,
      pocket48Token
    }: OptionsItemPocket48V2 = this.config;

    if (!pocket48RoomListener) return;

    if (!(pocket48ServerId && pocket48Account && pocket48Token)) return;

    // 判断socket列表内是否有当前房间的socket连接
    const index: number = qChatSocketList.findIndex(
      (o: QChatSocket): boolean => o.pocket48ServerId === pocket48ServerId);

    this.qChatSocketId = randomUUID();

    if (index < 0) {
      const qChatSocket: QChatSocket = new QChatSocket({
        pocket48Account,
        pocket48Token,
        pocket48ServerId
      });

      await qChatSocket.init();
      qChatSocket.addQueue({
        id: this.qChatSocketId,
        onmsgs: this.handleRoomSocketMessage
      });
      qChatSocketList.push(qChatSocket); // 添加到列表
      this.qChatSocket = qChatSocket;
    } else {
      qChatSocketList[index].addQueue({
        id: this.qChatSocketId,
        onmsgs: this.handleRoomSocketMessage
      });
      this.qChatSocket = qChatSocketList[index];
    }

    if (this.qq.membersList?.length) {
      const idx: number = this.qq.membersList.findIndex((o: MemberInfo): boolean => o.serverId === `${ pocket48ServerId }`);

      if (idx >= 0) {
        this.memberInfo = this.qq.membersList[idx];
      }
    }
  }

  // 移除socket连接
  disconnectPocket48(): void {
    const { pocket48ServerId, pocket48LiveRoomId }: OptionsItemPocket48V2 = this.config;
    const index: number = qChatSocketList.findIndex((o: QChatSocket): boolean => o.pocket48ServerId === pocket48ServerId);

    if (index >= 0 && this.qChatSocketId) {
      qChatSocketList[index].removeQueue(this.qChatSocketId);

      if (qChatSocketList[index].queues.length === 0) {
        qChatSocketList[index].disconnect();
        qChatSocketList.splice(index, 1);
      }
    }

    if (this.nimChatroom) {
      const index2: number = nimChatroomList.findIndex(
        (o: NimChatroomSocket): boolean => o.pocket48RoomId === pocket48LiveRoomId);

      if (index2 >= 0 && this.qChatSocketId) {
        nimChatroomList[index2].removeQueue(this.qChatSocketId);

        if (nimChatroomList[index2].queues.length === 0) {
          nimChatroomList[index2].disconnect();
          nimChatroomList.splice(index2, 1);
        }
      }
    }

    this.qChatSocketId = undefined;
    this.nimChatroom = undefined;
    this.giftList = undefined;
    this.qingchunshikeGiftList = undefined;
  }

  // 销毁
  destroy(): void {
    // 销毁口袋监听
    if (this.qChatSocketId) {
      this.disconnectPocket48();
    }
  }
}

export default Pocket48V2Expand;