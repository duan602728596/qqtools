import * as path from 'node:path';
import { ipcRenderer } from 'electron';
import type * as NodeNim from 'node-nim';
import type { NIMChatRoomEnterStep, ChatRoomInfo, ChatRoomMemberInfo, ChatRoomMessage } from 'node-nim';
import { NodeNimLoginHandleChannel } from '@qqtools3/main/src/channelEnum';
import appKey from './appKey.mjs';
import { isWindowsArm } from '../function/helper';

type OnMessage = (t: NodeNimChatroomSocket, event: Array<ChatRoomMessage>) => void | Promise<void>;

interface Queue {
  id: string;
  onmsgs(msg: Array<ChatRoomMessage>): void;
}

/* 网易云信C++ sdk的socket连接 */
class NodeNimChatroomSocket {
  #nodeNim: typeof NodeNim | undefined = undefined;
  public account: string;
  public token: string;
  public roomId: number;
  public appDataDir: string;
  public chatroomRequestLoginResult: string;
  public chatroom: NodeNim.ChatRoom | undefined;
  public queues: Array<Queue>;

  constructor(account: string, token: string, roomId: number, appDataDir: string, onMessage?: OnMessage) {
    if (!isWindowsArm) {
      const nodeNim: { default: typeof NodeNim } | typeof NodeNim = globalThis.require('node-nim');

      this.#nodeNim = 'default' in nodeNim ? nodeNim.default : nodeNim;
    }

    this.account = account; // 账号
    this.token = token;     // token
    this.roomId = roomId;   // 房间id
    this.appDataDir = path.join(appDataDir, account); // app数据目录
    this.queues = [];
  }

  // chatroom初始化
  chatroomInit(): Promise<void> {
    return new Promise((resolve: Function, reject: Function): void => {
      this.chatroom = new this.#nodeNim!.ChatRoom();
      this.chatroom.init('', '');
      this.chatroom.initEventHandlers();

      this.chatroom.on('enter', (
        rid: number,
        status: NIMChatRoomEnterStep,
        status2: number,
        roomInfo: ChatRoomInfo,
        myInfo: ChatRoomMemberInfo
      ): void => {
        console.log('Chatroom连接状态：', status, status2);

        if (status === 5 && status2 === 200) {
          console.log('Chatroom连接成功', roomInfo);

          this.chatroom!.on('receiveMsg', (n: number, msg: ChatRoomMessage): void => {
            for (const item of this.queues) {
              item.onmsgs([msg]);
            }
          });

          resolve();
        }
      });

      this.chatroom.enter(this.roomId, this.chatroomRequestLoginResult, {}, '');
    });
  }

  async init(): Promise<boolean> {
    if (!this.#nodeNim) return false;

    const chatroomRequestLoginResult: string | null = await ipcRenderer.invoke(NodeNimLoginHandleChannel.NodeNimLogin, {
      appKey,
      account: this.account,
      token: this.token,
      appDataDir: this.appDataDir,
      roomId: this.roomId
    });

    console.log('获取Chatroom登录结果: ', chatroomRequestLoginResult);

    if (!chatroomRequestLoginResult) return false;

    this.chatroomRequestLoginResult = chatroomRequestLoginResult;
    await this.chatroomInit();

    return true;
  }

  exit(): void {
    if (this.chatroom) {
      this.chatroom.exit(this.roomId, '');
      this.chatroom.cleanup('');
    }
  }

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
}

export default NodeNimChatroomSocket;