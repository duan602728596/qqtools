import { randomUUID } from 'node:crypto';
import type { MessageElem } from 'oicq';
import * as dayjs from 'dayjs';
import NimChatroomSocket, { type ChatroomMember } from '../NimChatroomSocket';
import { nimChatroomSocketList } from '../Basic';
import { getRoomMessage, getRoomMessageForOicq, getLogMessage, log, type RoomMessageArgs } from '../utils/pocket48Utils';
import { plain } from '../utils/miraiUtils';
import { isOicq } from './utils';
import type QQ from '../QQ';
import type OicqQQ from '../OicqQQ';
import type { OptionsItemPocket48, MemberInfo } from '../../types';
import type { NIMMessage, CustomMessageAll, MessageChain } from '../qq.types';

/* 口袋48 */
class Pocket48Expand {
  public config: OptionsItemPocket48;
  public qq: QQ | OicqQQ;
  public nimChatroomSocketId?: string;     // 对应的nim的唯一socketId
  public nimChatroom?: NimChatroomSocket;  // socket
  public memberInfo?: MemberInfo;          // 房间成员信息
  public membersList?: Array<MemberInfo>;  // 所有成员信息
  public membersCache?: Array<MemberInfo>; // 缓存
  public ownerOnlineCache?: boolean;       // 成员是否在线
  public ownerOnlineTimer?: number;        // 判断成员是否在线的监听
  public roomEntryListener?: number;       // 成员进出的监听器

  constructor({ config, qq }: { config: OptionsItemPocket48; qq: QQ | OicqQQ }) {
    this.config = config;
    this.qq = qq;
  }

  // 处理单个消息
  async roomSocketMessage(event: Array<NIMMessage>): Promise<void> {
    const {
      pocket48LiveAtAll,
      pocket48ShieldMsgType,
      pocket48MemberInfo,
      pocket48LogSave,
      pocket48LogDir
    }: OptionsItemPocket48 = this.config;
    const data: NIMMessage = event[0]; // 房间信息数组
    const customInfo: CustomMessageAll = JSON.parse(data.custom); // 房间自定义信息
    const { sessionRole }: CustomMessageAll = customInfo;         // 信息类型和sessionRole

    if (Number(sessionRole) === 0 && customInfo.messageType !== 'PRESENT_TEXT') return; // 过滤发言

    if (pocket48ShieldMsgType && pocket48ShieldMsgType.includes(customInfo.messageType)) {
      return; // 屏蔽信息类型
    }

    // 发送的数据
    const roomMessageArgs: RoomMessageArgs = {
      customInfo,
      data,
      pocket48LiveAtAll,
      event,
      pocket48ShieldMsgType,
      memberInfo: this.memberInfo,
      pocket48MemberInfo
    };

    if (isOicq(this.qq)) {
      const sendGroup: Array<MessageElem> = getRoomMessageForOicq(roomMessageArgs);

      if (sendGroup.length > 0) {
        await this.qq.sendMessage(sendGroup);
      }
    } else {
      const sendGroup: Array<MessageChain> = getRoomMessage(roomMessageArgs);

      if (sendGroup.length > 0) {
        await this.qq.sendMessage(sendGroup);
      }
    }

    // 日志
    if (pocket48LogSave && pocket48LogDir && !/^\s*$/.test(pocket48LogDir)) {
      const logData: string | undefined = getLogMessage({
        customInfo,
        data,
        event,
        memberInfo: this.memberInfo
      });

      if (logData) {
        await log(pocket48LogDir, logData);
      }
    }
  }

  // 循环处理所有消息
  async roomSocketMessageAll(event: Array<NIMMessage>): Promise<void> {
    for (const item of event) {
      try {
        await this.roomSocketMessage([item]);
      } catch (err) {
        console.error(err);
      }
    }
  }

  // 事件监听
  handleRoomSocketMessage: Function = (event: Array<NIMMessage>): void => {
    this.roomSocketMessageAll(event);
  };

  // 获取房间信息
  handleRoomEntryTimer: Function = async (): Promise<void> => {
    try {
      const members: Array<ChatroomMember> = await this.nimChatroom!.getChatroomMembers();
      const entryLog: string[] = [], // 进入房间的log日志的数组
        outputLog: string[] = [];    // 退出房间的log日志的数组
      const nowMembers: Array<MemberInfo> = []; // 本次房间内小偶像的数组
      const name: string = this.memberInfo?.ownerName!;
      const { pocket48LogSave, pocket48LogDir }: OptionsItemPocket48 = this.config;

      // 获取进入房间的信息
      for (const member of members) {
        // 判断是否是小偶像
        const idx: number = (this.membersList ?? []).findIndex((o: MemberInfo): boolean => o.account === member.account);

        if (idx < 0) {
          continue;
        }

        const xoxMember: MemberInfo = this.membersList![idx];

        nowMembers.push(xoxMember); // 当前房间的小偶像

        // 没有缓存时不做判断
        if (!this.membersCache) {
          console.log(`${ xoxMember.ownerName } 在 ${ name } 的房间内`);
          continue;
        }

        // 判断是否进入过房间（存在于缓存中）
        const idx1: number = this.membersCache.findIndex((o: MemberInfo): boolean => o.account === xoxMember.account);

        if (idx1 < 0) {
          entryLog.push(`${ xoxMember.ownerName } 进入了 ${ name } 的房间`);
        }
      }

      // 离开房间的信息（缓存内的信息不在新信息中）
      if (this.membersCache) {
        for (const member of this.membersCache) {
          const idx: number = nowMembers.findIndex((o: MemberInfo): boolean => o.account === member.account);

          if (idx < 0) {
            outputLog.push(`${ member.ownerName } 离开了 ${ name } 的房间`);
          }
        }
      }

      this.membersCache = nowMembers; // 保存当前房间的xox信息

      const allLogs: Array<string> = entryLog.concat(outputLog);

      if (allLogs?.length) {
        const logText: string = `${ dayjs().format('YYYY-MM-DD HH:mm:ss') }\n${ allLogs.join('\n') }`;

        if (isOicq(this.qq)) {
          await this.qq.sendMessage(logText);
        } else {
          await this.qq.sendMessage([plain(logText)]);
        }

        // 日志
        if (pocket48LogSave && pocket48LogDir && !/^\s*$/.test(pocket48LogDir)) {
          await log(pocket48LogDir, logText);
        }
      }
    } catch (err) {
      console.error(err);
    }

    this.roomEntryListener = setTimeout(this.handleRoomEntryTimer, 20_000);
  };

  // 成员在线离线监听
  handleOwnerOnlineTimer: Function = async (): Promise<void> => {
    try {
      const members: Array<ChatroomMember> = await this.nimChatroom!.getChatroomMembers(false);
      const online: boolean = members[0]?.online;
      const name: string = this.memberInfo?.ownerName!;

      if (this.ownerOnlineCache === false && online === true) {
        const text: string = `${ name } 进入自己的房间。
时间：${ dayjs().format('YYYY-MM-DD HH:mm:ss') }`;

        if (isOicq(this.qq)) {
          await this.qq.sendMessage(text);
        } else {
          await this.qq.sendMessage([plain(text)]);
        }
      }

      if (this.ownerOnlineCache === true && online === false) {
        const text: string = `${ name } 离开自己的房间。
时间：${ dayjs().format('YYYY-MM-DD HH:mm:ss') }`;

        if (isOicq(this.qq)) {
          await this.qq.sendMessage(text);
        } else {
          await this.qq.sendMessage([plain(text)]);
        }
      }

      this.ownerOnlineCache = online;
    } catch (err) {
      console.error(err);
    }

    this.ownerOnlineTimer = setTimeout(this.handleOwnerOnlineTimer, 20_000);
  };

  // 口袋48监听初始化
  async initPocket48(): Promise<void> {
    const {
      pocket48RoomListener,
      pocket48RoomId,
      pocket48IsAnonymous,
      pocket48Account,
      pocket48Token,
      pocket48RoomEntryListener,
      pocket48OwnerOnlineListener,
      pocket48MemberInfo
    }: OptionsItemPocket48 = this.config;

    if (!pocket48RoomListener) return;

    if (!(pocket48IsAnonymous || (pocket48RoomId && pocket48Account && pocket48Token))) return;

    // 判断socket列表内是否有当前房间的socket连接
    const index: number = nimChatroomSocketList.findIndex((o: NimChatroomSocket): boolean => o.pocket48RoomId === pocket48RoomId);

    this.nimChatroomSocketId = randomUUID();

    if (index < 0) {
      const nimChatroomSocket: NimChatroomSocket = new NimChatroomSocket({
        pocket48IsAnonymous,
        pocket48Account,
        pocket48Token,
        pocket48RoomId
      });

      await nimChatroomSocket.init();
      nimChatroomSocket.addQueue({
        id: this.nimChatroomSocketId,
        onmsgs: this.handleRoomSocketMessage
      });
      nimChatroomSocketList.push(nimChatroomSocket); // 添加到列表
      this.nimChatroom = nimChatroomSocket;
    } else {
      nimChatroomSocketList[index].addQueue({
        id: this.nimChatroomSocketId,
        onmsgs: this.handleRoomSocketMessage
      });
      this.nimChatroom = nimChatroomSocketList[index];
    }

    if ((pocket48RoomEntryListener || pocket48OwnerOnlineListener || pocket48MemberInfo) && this.membersList?.length) {
      const idx: number = this.membersList.findIndex((o: MemberInfo): boolean => o.roomId === `${ pocket48RoomId }`);

      if (idx >= 0) {
        this.memberInfo = this.membersList[idx];
        pocket48RoomEntryListener && this.handleRoomEntryTimer();
        pocket48OwnerOnlineListener && this.handleOwnerOnlineTimer();
      }
    }
  }

  // 移除socket连接
  disconnectPocket48(): void {
    const { pocket48RoomId }: OptionsItemPocket48 = this.config;
    const index: number = nimChatroomSocketList.findIndex((o: NimChatroomSocket): boolean => o.pocket48RoomId === pocket48RoomId);

    typeof this.roomEntryListener === 'number' && clearTimeout(this.roomEntryListener);
    typeof this.ownerOnlineTimer === 'number' && clearTimeout(this.ownerOnlineTimer);

    if (index >= 0 && this.nimChatroomSocketId) {
      nimChatroomSocketList[index].removeQueue(this.nimChatroomSocketId);

      if (nimChatroomSocketList[index].queues.length === 0) {
        nimChatroomSocketList[index].disconnect();
        nimChatroomSocketList.splice(index, 1);
      }
    }

    this.nimChatroomSocketId = undefined;
  }

  // 销毁
  destroy(): void {
    if (this.nimChatroomSocketId) {
      this.disconnectPocket48();
    }
  }
}

export default Pocket48Expand;