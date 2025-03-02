import { randomUUID } from 'node:crypto';
import NIM_SDK from '@yxim/nim-web-sdk/dist/SDK/NIM_Web_SDK.js';
import type NIM_Web_Chatroom from '@yxim/nim-web-sdk/dist/SDK/NIM_Web_Chatroom';
import type { NIMChatroomMessage } from '@yxim/nim-web-sdk/dist/SDK/NIM_Web_Chatroom/NIMChatroomMessageInterface';
import { message } from 'antd';
import type { MessageInstance } from 'antd/es/message/interface';
import appKey from './appKey.mjs';
import type { NIMError } from '../qq.types';

interface Queue {
  id: string;
  onmsgs: Function;
}

interface NimChatroomSocketArgs {
  pocket48IsAnonymous?: boolean;
  pocket48Account?: string;
  pocket48Token?: string;
  pocket48RoomId?: string;
  message?: MessageInstance;
  messageIgnore?: boolean;
}

export interface ChatroomMember {
  type: string;
  account: string;
  online: boolean;
}

/**
 * 创建网易云信sdk的socket连接
 * 同一个房间只能连接一次，所以需要复用
 */
class NimChatroomSocket {
  public pocket48IsAnonymous?: boolean;
  public pocket48Account?: string;
  public pocket48Token?: string;
  public pocket48RoomId?: string;
  public queues: Array<Queue>;
  public nimChatroomSocket: NIM_Web_Chatroom | undefined; // 口袋48
  #messageApi: typeof message | MessageInstance = message;
  #messageIgnore: boolean = false;

  constructor(arg: NimChatroomSocketArgs) {
    this.pocket48IsAnonymous = arg.pocket48IsAnonymous; // 是否为游客模式
    this.pocket48Account = arg.pocket48Account;         // 账号
    this.pocket48Token = arg.pocket48Token;             // token
    this.pocket48RoomId = arg.pocket48RoomId;           // 房间id
    this.queues = [];
    arg.message && (this.#messageApi = arg.message);
    arg.messageIgnore && (this.#messageIgnore = arg.messageIgnore);
  }

  // 初始化
  init(): Promise<void> {
    const self: this = this;

    return new Promise((resolve: Function, reject: Function): void => {
      const options: any = self.pocket48IsAnonymous ? {
        isAnonymous: true,
        chatroomNick: randomUUID(),
        chatroomAvatar: ''
      } : {
        account: this.pocket48Account,
        token: this.pocket48Token
      };

      this.nimChatroomSocket = NIM_SDK.Chatroom.getInstance({
        appKey: atob(appKey),
        chatroomId: this.pocket48RoomId,
        chatroomAddresses: ['chatweblink01.netease.im:443'],
        onconnect(event: any): void {
          resolve();
          console.log('进入聊天室', event);
          !this.#messageIgnore && self.#messageApi.success(`进入口袋48房间。房间ID：[${ self.pocket48RoomId }]`);
        },
        onmsgs: this.handleRoomSocketMessage,
        onerror: this.handleRoomSocketError,
        ondisconnect: this.handleRoomSocketDisconnect,
        db: false,
        dbLog: false,
        ...options
      });
    });
  }

  // 事件监听
  handleRoomSocketMessage: Function = (event: Array<NIMChatroomMessage>): void => {
    for (const item of this.queues) {
      item.onmsgs(event);
    }
  };

  // 进入房间失败
  handleRoomSocketError: Function = (err: NIMError, event: any): void => {
    console.log('发生错误', err, event);
    !this.#messageIgnore && this.#messageApi.error('进入口袋48房间失败');
  };

  // 断开连接
  handleRoomSocketDisconnect: Function = (err: NIMError): void => {
    console.log('连接断开', err);
    !this.#messageIgnore && this.#messageApi.error(`连接断开。房间ID：[${ this.pocket48RoomId }]`);
  };

  // 添加队列
  addQueue(queue: Queue): void {
    this.queues.push(queue);
  }

  // 移除队列
  removeQueue(id: string): void {
    const index: number = this.queues.findIndex((o: Queue): boolean => o.id === id);

    if (index >= 0) {
      this.queues.splice(index, 1);
    }
  }

  // 断开连接
  disconnect(): void {
    if (this.queues.length === 0) {
      this.nimChatroomSocket?.disconnect?.({ done(): void { /* noop */ } });
      this.nimChatroomSocket = undefined;
    }
  }

  /**
   * 获取当前房间内的参观者
   * @param { boolean } [guest = true] - 是否为游客（其他小偶像也为游客）
   */
  getChatroomMembers(guest: boolean = true): Promise<Array<ChatroomMember>> {
    return new Promise((resolve: Function, reject: Function): void => {
      this.nimChatroomSocket!.getChatroomMembers({
        guest,
        done(err: Error, arg1: { members: Array<ChatroomMember> }): void {
          resolve(arg1?.members ?? []);
        }
      });
    });
  }
}

export default NimChatroomSocket;