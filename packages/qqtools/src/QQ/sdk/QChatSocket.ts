import QChatSDK from 'nim-web-sdk-ng/dist/QCHAT_BROWSER_SDK';
import NIMSDK from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK';
import type { LoginResult } from 'nim-web-sdk-ng/dist/QCHAT_BROWSER_SDK/types';
import type { SubscribeAllChannelResult, ServerInfo } from 'nim-web-sdk-ng/dist/QCHAT_BROWSER_SDK/QChatServerServiceInterface';
import type { QChatMessage, QChatSystemNotification } from 'nim-web-sdk-ng/dist/QCHAT_BROWSER_SDK/QChatMsgServiceInterface';
import type { SystemNotificationEvent } from 'nim-web-sdk-ng/dist/QCHAT_BROWSER_SDK/QChatInterface';
import { message, notification } from 'antd';
import type { MessageInstance } from 'antd/es/message/interface';
import type { NotificationInstance } from 'antd/es/notification/interface';
import appKey from './appKey.mjs';

interface Queue {
  id: string;
  onmsgs: Function;
}

interface QChatSocketArgs {
  pocket48Account: string;
  pocket48Token: string;
  pocket48ServerId: string;
  message?: MessageInstance;
  notification?: NotificationInstance;
}

/* 创建网易云信sdk的socket连接 */
class QChatSocket {
  public pocket48Account: string;
  public pocket48Token: string;
  public pocket48ServerId: string;
  public nim?: NIMSDK;
  public qChat?: QChatSDK;
  public queues: Array<Queue> = [];
  public serverInfo: ServerInfo;
  #messageApi: typeof message | MessageInstance = message;
  #notificationApi: typeof notification | NotificationInstance = notification;

  constructor(options: QChatSocketArgs) {
    this.pocket48Account = options.pocket48Account;
    this.pocket48Token = options.pocket48Token;
    this.pocket48ServerId = options.pocket48ServerId;

    options.message && (this.#messageApi = options.message);
    options.notification && (this.#notificationApi = options.notification);
  }

  // 初始化
  async init(): Promise<void> {
    // 获取地址
    this.nim = new NIMSDK({
      appkey: atob(appKey),
      account: this.pocket48Account,
      token: this.pocket48Token
    });

    await this.nim.connect();

    this.qChat = new QChatSDK({
      appkey: atob(appKey),
      account: this.pocket48Account,
      token: this.pocket48Token,
      linkAddresses: await this.nim.plugin.getQChatAddress({ ipType: 2 })
    });

    this.qChat.on('logined', this.handleLogined);
    this.qChat.on('message', this.handleMessage);
    this.qChat.on('disconnect', this.handleRoomSocketDisconnect);

    if (process.env.NODE_ENV === 'development') {
      this.qChat.on('systemNotification', this.handleSystemNotification);
      this.qChat.on('systemNotificationUpdate', this.handleSystemNotificationUpdate);
    }
  }

  // 登录成功
  handleLogined: (loginResult: LoginResult) => Promise<void> = async (loginResult: LoginResult): Promise<void> => {
    const result: SubscribeAllChannelResult = await this.qChat!.qchatServer.subscribeAllChannel({
      type: 1,
      serverIds: [this.pocket48ServerId]
    });

    if (result.failServerIds.length) {
      this.#notificationApi.error({
        message: '订阅服务器失败',
        description: `ServerId: ${ result.failServerIds[0] }`
      });
    }

    const serverInfo: Array<ServerInfo> = await this.qChat!.qchatServer.getServers({
      serverIds: [this.pocket48ServerId]
    });

    this.serverInfo = serverInfo[0];
    console.log('serverInfo', this.serverInfo, '订阅servers', result);

    if (process.env.NODE_ENV === 'development') {
      await this.qChat!.qchatServer.subscribeServer({
        type: 4,
        opeType: 1,
        servers: [{ serverId: this.pocket48ServerId }]
      });
    }
  };

  // message
  handleMessage: (event: QChatMessage) => void = (event: QChatMessage): void => {
    for (const item of this.queues) {
      item.onmsgs(event);
    }
  };

  // 系统消息
  handleSystemNotification: (event: SystemNotificationEvent) => void = (event: SystemNotificationEvent): void => {
    const systemNotifications: Array<QChatSystemNotification> = event.systemNotifications;

    for (const systemNotification of systemNotifications) {
      if (systemNotification.attach.serverInfo?.serverId === this.pocket48ServerId) {
        console.log('systemNotification', systemNotification.type, systemNotification);
      }
    }
  };

  handleSystemNotificationUpdate: (event: QChatSystemNotification) => void = (event: QChatSystemNotification): void => {
    if (event.attach.serverInfo?.serverId === this.pocket48ServerId) {
      console.log('systemNotificationUpdate', event.type, event);
    }
  };

  // 断开连接
  handleRoomSocketDisconnect: () => void = (...args: any[]): void => {
    console.log('连接断开', args);
    this.#messageApi.error(`连接断开。ServerID：[${ this.pocket48ServerId }]`);
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
  async disconnect(): Promise<void> {
    if (this.queues.length === 0) {
      await this.qChat?.logout?.();
      await this.nim?.destroy?.();
      this.qChat = undefined;
      this.nim = undefined;
    }
  }
}

export default QChatSocket;