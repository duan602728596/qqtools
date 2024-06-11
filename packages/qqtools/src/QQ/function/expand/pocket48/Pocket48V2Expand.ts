import { randomUUID } from 'node:crypto';
import * as dayjs from 'dayjs';
import { requestGiftList, type GiftMoneyItem, type GiftMoneyGroup, type GiftMoney } from '@qqtools-api/48';
import type { ChannelInfo } from 'nim-web-sdk-ng/dist/QCHAT_BROWSER_SDK/QChatChannelServiceInterface';
import type { QChatSystemNotification } from 'nim-web-sdk-ng/dist/QCHAT_BROWSER_SDK/QChatMsgServiceInterface';
import type { ChatRoomMessage } from 'node-nim';
import QChatSocket from '../../../sdk/QChatSocket';
import NodeNimChatroomSocket from '../../../sdk/NodeNimChatroomSocket';
import { isWindowsArm } from '../../helper';
import { qChatSocketList, nimChatroomList } from '../../../QQBotModals/Basic';
import { getRoomMessage, getLogMessage, log, type RoomMessageArgs } from './pocket48V2Utils';
import { pocket48LiveRoomSendGiftText, pocket48LiveRoomSendGiftLeaderboardText, type GiftItem } from './giftCompute';
import { Pocket48Login } from '../../../../functionalComponents/Pocket48Login/enum';
import type { QQModals } from '../../../QQBotModals/ModalTypes';
import type { OptionsItemPocket48V2, MemberInfo } from '../../../../commonTypes';
import type { CustomMessageAllV2, UserV2, LiveRoomGiftInfoCustom, LiveRoomLiveCloseCustom } from '../../../qq.types';

/* 口袋48 */
class Pocket48V2Expand {
  static channelIdMap: Map<string, Array<ChannelInfo>> = new Map();

  public config: OptionsItemPocket48V2;
  public qq: QQModals;
  public qChatSocketId?: string;                  // 对应的nim的唯一socketId
  public qChatSocket?: QChatSocket;               // socket
  public nimChatroom?: NodeNimChatroomSocket;     // 口袋48直播间
  public memberInfo?: MemberInfo;                 // 房间成员信息
  public membersList?: Array<MemberInfo>;         // 所有成员信息
  public membersMap?: Map<string, MemberInfo>;    // 所有成员信息
  public giftList?: Array<GiftItem>;              // 礼物榜
  public qingchunshikeGiftList?: Array<GiftItem>; // 青春时刻
  public giftUserId?: number;                     // 用户ID
  public giftNickName?: string;                   // 用户名
  public giftMoneyList?: Array<GiftMoneyItem>;    // 礼物信息的缓存

  constructor({ config, qq, membersList }: {
    config: OptionsItemPocket48V2;
    qq: QQModals;
    membersList: Array<MemberInfo> | undefined;
  }) {
    this.config = config;
    this.qq = qq;
    this.membersList = membersList;

    if (this.membersList?.length) {
      this.membersMap = new Map();
      this.membersList.forEach((value: MemberInfo) => {
        if (value.account) {
          this.membersMap!.set(value.account, value);
        }
      });
    }
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
        await this.qq.sendMessageText(sendGroup.join(''));
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

      const appDataDir: string | null = localStorage.getItem(Pocket48Login.AppDataDir);

      if (!appDataDir) {
        console.error('最新的网易云信SDK需要手动配置App Data目录后才能使用。\n您需要配置后才能使用弹幕功能。');
      }

      // 直播统计
      if (
        !isWindowsArm
        && pocket48LiveListener
        && pocket48Account
        && pocket48Token
        && pocket48LiveRoomId
        && appDataDir
        && (pocket48LiveRoomSendGiftInfo || pocket48LiveRoomSendGiftLeaderboard)
        && event.type === 'custom'
        && event.attach.messageType === 'LIVEPUSH'
        && this.qChatSocketId
      ) {
        this.giftList = [];
        this.qingchunshikeGiftList = [];
        this.giftUserId = user!.userId;
        this.giftNickName = user!.nickName;

        if (!(this?.giftMoneyList?.length)) {
          const resGift: GiftMoney = await requestGiftList(this.giftUserId!);

          this.giftMoneyList = resGift.content.map((o: GiftMoneyGroup) => o.giftList).flat();
        }

        const index: number = nimChatroomList.findIndex(
          (o: NodeNimChatroomSocket): boolean => o.roomId === Number(pocket48LiveRoomId));

        if (index < 0) {
          this.nimChatroom = new NodeNimChatroomSocket(
            pocket48Account,
            pocket48Token,
            Number(pocket48LiveRoomId),
            appDataDir
          );
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

  // 系统事件
  handleSystemMessage: Function = async (notification: QChatSystemNotification): Promise<void> => {
    const { pocket48SystemMessage }: OptionsItemPocket48V2 = this.config;

    if (pocket48SystemMessage && this.membersList?.length && this.membersMap) {
      const user: MemberInfo | undefined = this.membersMap.get(notification.fromAccount);

      if (user) {
        if (notification.type === 'serverMemberLeave') {
          console.log('serverMemberLeave', notification);
          await this.qq.sendMessageText(`口袋48系统消息：${ user.ownerName } 取关了 ${
            notification.attach.serverInfo?.name ?? '未知成员'
          }\n时间：${ dayjs(notification.time).format('YYYY-MM-DD HH:mm:ss') }`);
        } else if (notification.type === 'serverMemberApplyDone') {
          console.log('serverMemberApplyDone', notification);
          await this.qq.sendMessageText(`口袋48系统消息：${ user.ownerName } 关注了 ${
            notification.attach.serverInfo?.name ?? '未知成员'
          }\n时间：${ dayjs(notification.time).format('YYYY-MM-DD HH:mm:ss') }`);
        }
      }
    }
  };

  // 处理单个消息
  async liveRoomSocketMessageOne(msg: ChatRoomMessage): Promise<void> {
    if (msg.msg_type_ !== 1000 || !msg.msg_setting_?.ext_) return;

    const customJson: LiveRoomGiftInfoCustom | LiveRoomLiveCloseCustom = JSON.parse(msg.msg_setting_.ext_);
    const { pocket48LiveRoomSendGiftInfo, pocket48LiveRoomSendGiftLeaderboard }: OptionsItemPocket48V2 = this.config;

    // 礼物信息
    if ('giftInfo' in customJson) {
      const giftInfo: GiftItem = {
        giftId: customJson.giftInfo.giftId,
        giftName: customJson.giftInfo.giftName,
        giftNum: customJson.giftInfo.giftNum,
        nickName: customJson.user.nickName,
        userId: customJson.user.userId,
        tpNum: customJson.giftInfo.tpNum
      };

      if (/^\d+(.\d+)?分$/.test(giftInfo.giftName) || Number(customJson.giftInfo.tpNum) > 0) {
        this.qingchunshikeGiftList?.push?.(giftInfo);
      } else {
        this.giftList?.push?.(giftInfo);
      }
    } else if (customJson.messageType === 'CLOSELIVE') {
      // 计算礼物信息
      if (pocket48LiveRoomSendGiftInfo && this.giftNickName) {
        const text: string | null = pocket48LiveRoomSendGiftText({
          qingchunshikeGiftList: this.qingchunshikeGiftList ?? [],
          giftList: this.giftList ?? [],
          giftMoneyList: this.giftMoneyList ?? [],
          giftNickName: this.giftNickName
        });

        text && (await this.qq.sendMessageText(text));
      }

      // 计算单人的排行榜
      if (pocket48LiveRoomSendGiftLeaderboard && this.giftNickName) {
        const text: string = pocket48LiveRoomSendGiftLeaderboardText({
          qingchunshikeGiftList: this.qingchunshikeGiftList ?? [],
          giftList: this.giftList ?? [],
          giftMoneyList: this.giftMoneyList ?? [],
          giftNickName: this.giftNickName
        });

        await this.qq.sendMessageText(text);
      }

      this.giftList = [];
      this.qingchunshikeGiftList = [];
      this.giftNickName = undefined;
      this.giftUserId = undefined;
      this.giftMoneyList = [];
      this.disconnectNIM();
    }
  }

  // 循环处理所有消息
  async liveRoomSocketMessageAll(event: Array<ChatRoomMessage>): Promise<void> {
    for (const msg of event) {
      await this.liveRoomSocketMessageOne(msg);
    }
  }

  // 直播间时间监听
  handleLiveRoomSocketMessage: (msgs: Array<ChatRoomMessage>) => void = (event: Array<ChatRoomMessage>): void => {
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
        onmsgs: this.handleRoomSocketMessage,
        onsystemmsgs: this.handleSystemMessage
      });
      qChatSocketList.push(qChatSocket); // 添加到列表
      this.qChatSocket = qChatSocket;
    } else {
      qChatSocketList[index].addQueue({
        id: this.qChatSocketId,
        onmsgs: this.handleRoomSocketMessage,
        onsystemmsgs: this.handleSystemMessage
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

  // 移除NIM连接
  disconnectNIM(): void {
    const { pocket48LiveRoomId }: OptionsItemPocket48V2 = this.config;

    if (this.nimChatroom) {
      const index2: number = nimChatroomList.findIndex(
        (o: NodeNimChatroomSocket): boolean => o.roomId === Number(pocket48LiveRoomId));

      if (index2 >= 0 && this.qChatSocketId) {
        nimChatroomList[index2].removeQueue(this.qChatSocketId);

        if (nimChatroomList[index2].queues.length === 0) {
          nimChatroomList[index2].exit();
          nimChatroomList.splice(index2, 1);
        }
      }
    }
  }

  // 移除socket连接
  disconnectPocket48(): void {
    const { pocket48ServerId }: OptionsItemPocket48V2 = this.config;
    const index: number = qChatSocketList.findIndex((o: QChatSocket): boolean => o.pocket48ServerId === pocket48ServerId);

    if (index >= 0 && this.qChatSocketId) {
      qChatSocketList[index].removeQueue(this.qChatSocketId);

      if (qChatSocketList[index].queues.length === 0) {
        qChatSocketList[index].disconnect();
        qChatSocketList.splice(index, 1);
      }
    }

    this.disconnectNIM();
    this.qChatSocketId = undefined;
    this.nimChatroom = undefined;
    this.giftList = undefined;
    this.qingchunshikeGiftList = undefined;
    this.giftNickName = undefined;
    this.giftUserId = undefined;
    this.giftMoneyList = undefined;
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