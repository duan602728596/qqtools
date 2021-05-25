import NIM_SDK from 'SDK';
import el from './sdk/eval';
import { message } from 'antd';
import { findIndex } from 'lodash-es';
import type { NIMMessage, NIMError } from './qq.types';

const { Chatroom }: any = NIM_SDK;

interface Queue {
  id: string;
  onmsgs: Function;
}

interface NimChatroomSocketArgs {
  pocket48Account: string;
  pocket48Token: string;
  pocket48RoomId: string;
}

export interface ChatroomMember {
  type: string;
  account: string;
}

/**
 * 创建网易云信sdk的socket连接
 * 同一个房间只能连接一次，所以需要复用
 */
class NimChatroomSocket {
  public pocket48Account: string;
  public pocket48Token: string;
  public pocket48RoomId: string;
  public queues: Array<Queue>;
  public nimChatroomSocket: any;   // 口袋48

  constructor(arg: NimChatroomSocketArgs) {
    this.pocket48Account = arg.pocket48Account; // 账号
    this.pocket48Token = arg.pocket48Token;     // token
    this.pocket48RoomId = arg.pocket48RoomId;   // 房间id
    this.queues = [];
  }

  // 初始化
  init(): Promise<void> {
    const self: this = this;

    return new Promise((resolve: Function, reject: Function): void => {
      this.nimChatroomSocket = Chatroom.getInstance({
        appKey: el,
        account: this.pocket48Account,
        token: this.pocket48Token,
        chatroomId: this.pocket48RoomId,
        chatroomAddresses: ['chatweblink01.netease.im:443'],
        onconnect(event: any): void {
          resolve();
          console.log('进入聊天室', event);
          message.success(`进入口袋48房间。房间ID：[${ self.pocket48RoomId }]`);
        },
        onmsgs: this.handleRoomSocketMessage,
        onerror: this.handleRoomSocketError,
        ondisconnect: this.handleRoomSocketDisconnect
      });
    });
  }

  // 事件监听
  handleRoomSocketMessage: Function = (event: Array<NIMMessage>): void => {
    for (const item of this.queues) {
      item.onmsgs(event);
    }
  };

  // 进入房间失败
  handleRoomSocketError: Function = (err: NIMError, event: any): void => {
    console.log('发生错误', err, event);
    message.error('进入口袋48房间失败');
  };

  // 断开连接
  handleRoomSocketDisconnect: Function = (err: NIMError): void => {
    console.log('连接断开', err);
    message.error(`连接断开。房间ID：[${ this.pocket48RoomId }]`);
  };

  // 添加队列
  addQueue(queue: Queue): void {
    this.queues.push(queue);
  }

  // 移除队列
  removeQueue(id: string): void {
    const index: number = findIndex(this.queues, { id });

    if (index >= 0) {
      this.queues.splice(index, 1);
    }
  }

  // 断开连接
  disconnect(): void {
    if (this.queues.length === 0) {
      this.nimChatroomSocket.disconnect();
      this.nimChatroomSocket = undefined;
    }
  }

  /**
   * 获取当前房间内的参观者
   * @param { boolean } guest: 是否为游客（其他小偶像也为游客）
   */
  getChatroomMembers(guest: boolean = true): Promise<Array<ChatroomMember>> {
    return new Promise((resolve: Function, reject: Function): void => {
      this.nimChatroomSocket.getChatroomMembers({
        guest,
        done(err: Error, arg1: { members: Array<ChatroomMember> }): void {
          resolve(arg1?.members ?? []);
        }
      });
    });
  }
}

export default NimChatroomSocket;