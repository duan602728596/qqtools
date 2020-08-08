import { message } from 'antd';
import * as moment from 'moment';
import NIM_SDK from 'SDK';
import { findIndex } from 'lodash';
import {
  requestAuth,
  requestVerify,
  requestRelease,
  requestSendGroupMessage,
  requestWeiboInfo,
  requestWeiboContainer
} from './services/services';
import { plain, image } from './messageData';
import el from './sdk/eval';
import { filterCards } from './weiboUtils';
import type { OptionsItemValue } from '../../types';
import type {
  AuthResponse,
  MessageResponse,
  MessageChain,
  MessageEventData,
  NIMError,
  NIMMessage,
  CustomMessageAll,
  WeiboTab,
  WeiboInfo,
  WeiboContainerList,
  WeiboCard,
  WeiboMBlog,
  WeiboSendData
} from './qq.types';

type MessageListener = (event: MessageEvent) => void | Promise<void>;

const { Chatroom }: any = NIM_SDK;

class QQ {
  public id: string;
  public config: OptionsItemValue;
  public eventSocket: WebSocket;
  public messageSocket: WebSocket;
  public session: string;
  public nimChatroomSocket: any;         // 口袋48
  public weiboLfid: string;              // 微博的lfid
  public weiboTimer: number | undefined; // 轮询定时器
  public weiboId: BigInt;                // 记录查询位置

  constructor(id: string, config: OptionsItemValue) {
    this.id = id;         // 当前登陆的唯一id
    this.config = config; // 配置
  }

  // 进入房间
  handleRoomSocketConnect: Function = (event: any): void => {
    console.log('进入聊天室', event);
    message.success('进入口袋48房间');
  };

  // 进入房间失败
  handleRoomSocketError: Function = (err: NIMError, event: any): void => {
    console.log('发生错误', err, event);
    message.error('进入口袋48房间失败');
  };

  // 断开连接
  handleRoomSocketDisconnect: Function = (err: NIMError): void => {
    console.log('连接断开', err);

    if (err.code === 'logout') {
      message.warn('断开连接');
    } else {
      message.error(`【${ err.code }】${ err.message }`);
    }
  };

  // 事件监听
  async roomSocketMessage(event: Array<NIMMessage>): Promise<void> {
    const data: NIMMessage = event[0];                                 // 房间信息数组
    const customInfo: CustomMessageAll = JSON.parse(data.custom);      // 房间自定义信息
    const { sessionRole }: CustomMessageAll = customInfo; // 信息类型和sessionRole

    if (Number(sessionRole) === 0) return; // 过滤发言

    const sendGroup: Array<MessageChain> = [];                  // 发送的数据
    const nickName: string = customInfo?.user?.nickName ?? '';  // 用户名
    const msgTime: string = moment(data.time).format('YYYY-MM-DD HH:mm:ss'); // 发送时间

    try {
      // 普通信息
      if (customInfo.messageType === 'TEXT') {
        sendGroup.push(
          plain(`${ nickName }：${ customInfo.text }
时间：${ msgTime }`)
        );
      } else

      // 回复信息
      if (customInfo.messageType === 'REPLY') {
        sendGroup.push(
          plain(`${ customInfo.replyName }：${ customInfo.replyText }
${ nickName }：${ customInfo.text }
时间：${ msgTime }`)
        );
      } else

      // 发送图片
      if (customInfo.messageType === 'IMAGE') {
        sendGroup.push(
          image(data.file.url),
          plain(`时间：${ msgTime }`)
        );
      } else

      // 发送语音
      if (customInfo.messageType === 'AUDIO') {
        sendGroup.push(
          plain(`${ nickName } 发送了一条语音：${ data.file.url }
时间：${ msgTime }`)
        );
      } else

      // 发送短视频
      if (customInfo.messageType === 'VIDEO') {
        sendGroup.push(
          plain(`${ nickName } 发送了一个视频：${ data.file.url }
时间：${ msgTime }`)
        );
      } else

      // 直播
      if (customInfo.messageType === 'LIVEPUSH') {
        sendGroup.push(
          plain(`${ nickName } 正在直播
直播标题：${ customInfo.liveTitle }
时间：${ msgTime }`)
        );
      } else

      // 鸡腿翻牌
      if (customInfo.messageType === 'FLIPCARD') {
        sendGroup.push(
          plain(`${ nickName } 翻牌了问题：
${ customInfo.question }
回答：${ customInfo.answer }
时间：${ msgTime }`)
        );
      } else

      // 发表情
      if (customInfo.messageType === 'EXPRESS') {
        sendGroup.push(
          plain(`${ nickName }：发送了一个表情。
时间：${ msgTime }`)
        );
      } else

      // 删除回复
      if (customInfo.messageType === 'DELETE') {
        // 什么都不做
      } else {
        // 未知信息类型
        sendGroup.push(
          plain(`${ nickName }：未知信息类型，请联系开发者。
数据：${ JSON.stringify(event) }
时间：${ msgTime }`)
        );
      }
    } catch (err) {
      console.error(err);
      sendGroup.push(
        plain(`信息发送错误，请联系开发者。
数据：${ JSON.stringify(event) }
时间：${ msgTime }`)
      );
    }

    if (sendGroup.length > 0) {
      const { groupNumber, socketPort }: OptionsItemValue = this.config;

      await requestSendGroupMessage(groupNumber, socketPort, this.session, sendGroup);
    }
  }

  // 事件监听
  handleRoomSocketMessage: Function = (event: Array<NIMMessage>): void => {
    this.roomSocketMessage(event);
  };

  // 口袋48监听初始化
  initPocket48(): void {
    const { pocket48RoomListener, pocket48RoomId, pocket48Account }: OptionsItemValue = this.config;

    if (!(pocket48RoomListener && pocket48RoomId && pocket48Account)) return;

    const account: number = Number(pocket48Account);

    this.nimChatroomSocket = Chatroom.getInstance({
      appKey: el,
      account,
      token: account,
      chatroomId: pocket48RoomId,
      chatroomAddresses: ['chatweblink01.netease.im:443'],
      onconnect: this.handleRoomSocketConnect,
      onmsgs: this.handleRoomSocketMessage,
      onerror: this.handleRoomSocketError,
      ondisconnect: this.handleRoomSocketDisconnect
    });
  }

  // 轮询
  weiboContainerListTimer: Function = async (): Promise<void> => {
    try {
      const resWeiboList: WeiboContainerList = await requestWeiboContainer(this.weiboLfid);
      const list: Array<WeiboCard> = filterCards(resWeiboList.data.cards);

      // 过滤新的微博
      const newList: Array<WeiboSendData> = list
        .filter((o: WeiboCard) => BigInt(o.mblog.id) > this.weiboId)
        .map((item: WeiboCard, index: number): WeiboSendData => {
          const mblog: WeiboMBlog = item.mblog;

          return {
            id: BigInt(mblog.id),
            name: mblog.user.screen_name,
            type: 'retweeted_status' in item.mblog ? '转载' : '原创',
            scheme: item.scheme,
            time: mblog.created_at === '刚刚' ? mblog.created_at : ('在' + mblog.created_at),
            text: mblog.text.replace(/<[^<>]+>/g, ' '),
            pics: (mblog.pics ?? []).map((item: { url: string }) => item.url)
          };
        });

      if (newList.length > 0) {
        this.weiboId = newList[0].id;

        for (const item of newList) {
          const sendGroup: Array<MessageChain> = [];

          sendGroup.push(
            plain(`${ item.name } ${ item.time }发送了一条微博：${ item.text }
类型：${ item.type }
地址：${ item.scheme }`)
          );

          if (item.pics.length > 0) {
            sendGroup.push(image(item.pics[0]));
          }

          const { groupNumber, socketPort }: OptionsItemValue = this.config;

          await requestSendGroupMessage(groupNumber, socketPort, this.session, sendGroup);
        }
      }
    } catch (err) {
      console.error(err);
    }

    this.weiboTimer = setTimeout(this.weiboContainerListTimer, 30000);
  };

  // 微博初始化
  async initWeiboWorker(): Promise<void> {
    const { weiboListener, weiboUid }: OptionsItemValue = this.config;

    if (!(weiboListener && weiboUid)) return;

    const resWeiboInfo: WeiboInfo = await requestWeiboInfo(weiboUid);
    const weiboTab: Array<WeiboTab> = resWeiboInfo.data.tabsInfo.tabs
      .filter((o: WeiboTab): boolean => o.tabKey === 'weibo');

    if (weiboTab.length > 0) {
      // 记录对比id
      this.weiboLfid = weiboTab[0].containerid;

      const resWeiboList: WeiboContainerList = await requestWeiboContainer(this.weiboLfid);
      const list: Array<WeiboCard> = filterCards(resWeiboList.data.cards);

      this.weiboId = list?.[0]._id ?? BigInt(0);
      this.weiboTimer = setTimeout(this.weiboContainerListTimer, 20000);
    }
  }

  // message事件监听
  handleMessageSocketMessage: MessageListener = async (event: MessageEvent): Promise<void> => {
    const { qqNumber, groupNumber, socketPort, customCmd }: OptionsItemValue = this.config;
    const data: MessageEventData = JSON.parse(event.data);

    console.log('message', JSON.parse(event.data));

    if (!(data.type === 'GroupMessage' && data.sender.id !== qqNumber && data.sender.group.id === groupNumber)) {
      return;
    }

    if (data.messageChain?.[1].type === 'Plain' && customCmd?.length) {
      const index: number = findIndex(customCmd, { cmd: data.messageChain[1].text });

      if (index >= 0) {
        let value: Array<MessageChain>;

        try {
          value = JSON.parse(customCmd[index].value);
        } catch (err) {
          value = [plain(customCmd[index].value)];
          console.error(err);
        }

        await requestSendGroupMessage(groupNumber, socketPort, this.session, value);
      }
    }
  }

  // socket事件监听
  handleEventSocketMessage: MessageListener = (event: MessageEvent): void => {
    console.log('event', JSON.parse(event.data));
  };

  // websocket初始化
  initWebSocket(): void {
    const { socketPort }: OptionsItemValue = this.config;

    this.messageSocket = new WebSocket(`ws://localhost:${ socketPort }/message?sessionKey=${ this.session }`);
    this.eventSocket = new WebSocket(`ws://localhost:${ socketPort }/event?sessionKey=${ this.session }`);

    this.messageSocket.addEventListener('message', this.handleMessageSocketMessage, false);
    this.eventSocket.addEventListener('message', this.handleEventSocketMessage, false);
  }

  // 获取session
  async getSession(): Promise<boolean> {
    const { qqNumber, socketPort, authKey }: OptionsItemValue = this.config;
    const authRes: AuthResponse = await requestAuth(socketPort, authKey);

    if (authRes.code !== 0) {
      message.error('登陆失败：获取session失败。');

      return false;
    }

    this.session = authRes.session;

    const verifyRes: MessageResponse = await requestVerify(qqNumber, socketPort, this.session);

    if (verifyRes.code === 0) {
      return true;
    } else {
      message.error('登陆失败：session认证失败。');

      return false;
    }
  }

  // 项目初始化
  async init(): Promise<boolean> {
    try {
      const result: boolean = await this.getSession();

      if (!result) throw new Error('登陆失败！');

      this.initWebSocket();
      this.initPocket48();
      await this.initWeiboWorker();

      return true;
    } catch (err) {
      console.error(err);

      return false;
    }
  }

  // 项目销毁
  async destroy(): Promise<boolean> {
    const { qqNumber, socketPort }: OptionsItemValue = this.config;

    try {
      await requestRelease(qqNumber, socketPort, this.session); // 清除session

      // 销毁socket监听
      this.eventSocket.removeEventListener('message', this.handleEventSocketMessage);
      this.messageSocket.removeEventListener('message', this.handleMessageSocketMessage);
      this.eventSocket.close();
      this.messageSocket.close();

      // 销毁口袋监听
      if (this.nimChatroomSocket) {
        this.nimChatroomSocket.disconnect();
        this.nimChatroomSocket = undefined;
      }

      // 销毁微博监听
      if (typeof this.weiboTimer === 'number') {
        clearTimeout(this.weiboTimer);
      }

      return true;
    } catch (err) {
      console.error(err);

      return false;
    }
  }
}

export default QQ;