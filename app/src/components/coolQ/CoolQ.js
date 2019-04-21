import { message } from 'antd';
import { requestRoomMessage, requestUserInformation, requestFlipAnswer } from '../kd48listerer/roomListener';
import { templateReplace, time } from '../../utils';
import { chouka } from '../chouka/chouka';
import * as storagecard from '../chouka/storagecard';
import bestCards from '../chouka/bestCards';

class CoolQ {
  /*
  time: ?number;
  qq: string;
  port: string;
  isError: boolean;
  eventUrl: string;
  eventSocket: ?WebSocket;
  isEventSuccess: boolean;
  apiUrl: string;
  apiSocket: ?WebSocket;
  isApiSuccess: boolean;
  callback: ?Function;
  coolqEdition: string;

  option: ?Object;
  modianTitle: ?string;
  modianGoal: ?string;
  modianWorker: ?Worker;
  choukaJson: ?Object;
  bukaQQNumber: ?Array<string>;
  members: ?RegExp;
  memberId: ?Array<string>;
  roomListenerTimer: ?number;
  roomLastTime: ?number;
  kouDai48Token: ?string;
  weiboWorker: ?Worker;
  timingMessagePushTimer: ?Object;

  handleOpenEventSocket: Function;
  handleEventSocketError: Function;
  handleListenerEventMessage: Function;
  handleOpenApiSocket: Function;
  handleApiSocketError: Function;
  handleListenerApiMessage: Function;
  */

  constructor(qq, port, callback) {
    this.time = null; // 登录时间戳
    this.qq = qq; // qq号
    this.port = port; // socket端口
    this.isError = false; // 判断是否错误
    this.eventUrl = `ws://127.0.0.1:${ this.port }/event/`; // 地址
    this.eventSocket = null; // socket
    this.isEventSuccess = false; // 判断是否连接成功
    this.apiUrl = `ws://127.0.0.1:${ this.port }/api/`; // 地址
    this.apiSocket = null; // socket
    this.isApiSuccess = false; // 判断是否连接成功
    this.callback = callback; // 获得信息后的回调
    this.coolqEdition = 'air'; // 酷Q的版本

    this.option = null; // 配置
    // 摩点项目相关
    this.modianTitle = null; // 摩点项目标题
    this.modianGoal = null; // 摩点项目目标
    this.modianWorker = null; // 摩点新线程
    this.choukaJson = null; // 抽卡配置
    this.bukaQQNumber = null; // 允许群里补卡的qq号
    // 口袋48监听相关
    this.members = null; // 监听指定成员
    this.memberId = null; // 坚听成员id
    // 房间信息监听相关
    this.roomListenerTimer = null; // 轮询定时器
    this.roomLastTime = null; // 最后一次发言
    this.kouDai48Token = null; // token
    // 微博监听相关
    this.weiboWorker = null; // 微博监听新线程
    // 群内定时消息推送
    this.timingMessagePushTimer = null; // 群内定时消息推送定时器

    this.handleOpenEventSocket = this._handleOpenSocket.bind(this, 'isEventSuccess', 'event');
    this.handleEventSocketError = this._handleSocketError.bind(this, 'event');
    this.handleListenerEventMessage = this._handleListenerMessage.bind(this, 'event');
    this.handleOpenApiSocket = this._handleOpenSocket.bind(this, 'isApiSuccess', 'api');
    this.handleApiSocketError = this._handleSocketError.bind(this, 'api');
    this.handleListenerApiMessage = this._handleListenerMessage.bind(this, 'api');
  }

  // 初始化连接
  _handleOpenSocket(key, type, event) {
    // $FlowFixMe
    this[key] = true;
    message.success(`【${ this.qq }】 Socket: ${ type }连接成功！`);
  }

  // 连接失败
  _handleSocketError(type, event) {
    this.isError = true;
    message.error(`【${ this.qq }】 Socket: ${ type }连接失败！请检查酷Q的配置是否正确！`);
  }

  // 接收消息
  _handleListenerMessage(type, event) {
    const dataJson = JSON.parse(`${ event.data }`);
    const gn = this.option ? Number(this.option.groupNumber) : 0;

    console.log(dataJson); // debug

    // 群消息
    if (type === 'event' && 'group_id' in dataJson && dataJson.group_id === gn && dataJson.self_id === Number(this.qq)) {
      // 群聊天
      if (dataJson.message_type === 'group') {
        this.callback && this.callback(dataJson, this);
      }
      // 新成员加入群
      if (
        (dataJson.post_type === 'notice' || dataJson.post_type === 'event')
        && (dataJson.notice_type === 'group_increase' || dataJson.event === 'group_increase')
        && this.option
        && this.option.basic.isNewGroupMember
      ) {
        this.getGroupMemberInfo(dataJson);
      }
    }
    // 群名片
    if ('data' in dataJson && 'nickname' in dataJson.data && 'group_id' in dataJson.data && dataJson.data.group_id === gn) {
      const { nickname, user_id } = dataJson.data;

      this.sendMessage(templateReplace(this.option ? this.option.basic.welcomeNewGroupMember : '', {
        nickname,
        userid: user_id
      }));
    }
    // 酷Q版本
    if ('data' in dataJson && 'coolq_edition' in dataJson.data) {
      this.coolqEdition = dataJson.data.coolq_edition;
    }
  }

  // 发送信息
  sendMessage(message) {
    this.apiSocket && this.apiSocket.send(JSON.stringify({
      action: 'send_group_msg',
      params: {
        group_id: this.option ? Number(this.option.groupNumber) : 0,
        message
      }
    }));
  }

  // 查找群成员的名片
  getGroupMemberInfo(dataJson) {
    const userId = dataJson.user_id;

    this.apiSocket && this.apiSocket.send(JSON.stringify({
      action: 'get_group_member_info',
      params: {
        group_id: this.option ? Number(this.option.groupNumber) : 0,
        user_id: userId,
        type: 'group_member_info'
      }
    }));
  }

  // 查询酷Q的信息
  getCoolQVersionInfo() {
    this.apiSocket && this.apiSocket.send(JSON.stringify({
      action: 'get_version_info'
    }));
  }

  // 初始化
  init() {
    // event
    this.eventSocket = new WebSocket(this.eventUrl);
    // $FlowFixMe
    this.eventSocket.addEventListener('open', this.handleOpenEventSocket, false);
    // $FlowFixMe
    this.eventSocket.addEventListener('error', this.handleEventSocketError, false);
    // $FlowFixMe
    this.eventSocket.addEventListener('message', this.handleListenerEventMessage, false);

    // api
    this.apiSocket = new WebSocket(this.apiUrl);
    // $FlowFixMe
    this.apiSocket.addEventListener('open', this.handleOpenApiSocket, false);
    // $FlowFixMe
    this.apiSocket.addEventListener('error', this.handleApiSocketError, false);
    // $FlowFixMe
    this.apiSocket.addEventListener('message', this.handleListenerApiMessage, false);
  }

  // 退出
  outAndClear() {
    // 删除摩点的web worker
    if (this.modianWorker) {
      this.modianWorker.postMessage({
        type: 'cancel'
      });
      // $FlowFixMe
      this.modianWorker.terminate();
      this.modianWorker = null;
    }

    // 关闭房间信息监听
    if (this.roomListenerTimer !== null) {
      global.clearTimeout(this.roomListenerTimer);
    }

    // 删除微博的web worker
    if (this.weiboWorker) {
      this.weiboWorker.postMessage({
        type: 'cancel'
      });
      // $FlowFixMe
      this.weiboWorker.terminate();
      this.weiboWorker = null;
    }

    // 删除群消息推送定时器
    if (this.timingMessagePushTimer) {
      this.timingMessagePushTimer.cancel();
    }

    // --- 关闭socket ---
    // event
    // $FlowFixMe
    this.eventSocket.removeEventListener('open', this.handleOpenEventSocket);
    // $FlowFixMe
    this.eventSocket.removeEventListener('error', this.handleEventSocketError);
    // $FlowFixMe
    this.eventSocket.removeEventListener('message', this.handleListenerEventMessage);

    // api
    // $FlowFixMe
    this.apiSocket.removeEventListener('open', this.handleOpenApiSocket);
    // $FlowFixMe
    this.apiSocket.removeEventListener('error', this.handleApiSocketError);
    // $FlowFixMe
    this.apiSocket.removeEventListener('message', this.handleListenerApiMessage);

    this.eventSocket && this.eventSocket.close();
    this.apiSocket && this.apiSocket.close();
  }

  /* === 从此往下是业务相关 === */

  // web worker监听到摩点的返回信息
  async listenModianWorkerCbInformation(event) {
    if (event.data.type === 'change') {
      try {
        const { data, alreadyRaised, backerCount, endTime, timedifference } = event.data;
        const { modianTemplate, isChouka, isChoukaSendImage } = this.option.basic;
        const amountDifference = (Number(this.modianGoal) - Number(alreadyRaised)).toFixed(2);
        const { cards, money, multiple, db } = this.choukaJson || {};

        // 倒序发送消息
        for (let i = data.length - 1; i >= 0; i--) {
          const item = data[i];

          // 抽卡
          const choukaStr = [];
          let cqImage = '';

          if (isChouka) {
            // 把卡存入数据库
            const kaResult = await storagecard.query(db, item.userid);
            const record = kaResult.length === 0 ? {} : JSON.parse(kaResult[0].record);

            const choukaResult = chouka(cards, money, Number(item.pay_amount), multiple);

            for (const key in choukaResult) {
              const item2 = choukaResult[key];
              const str = `【${ item2.level }】${ item2.name } * ${ item2.length }`;

              choukaStr.push(str);

              if (item2.id in record) record[item2.id] += item2.length;
              else record[item2.id] = item2.length;
            }

            if (isChoukaSendImage && this.coolqEdition === 'pro') {
              cqImage = bestCards(choukaResult, 2);
            }

            // 把卡存入数据库
            if (kaResult.length === 0) await storagecard.insert(db, item.userid, item.nickname, record);
            else await storagecard.update(db, item.userid, item.nickname, record);
          }

          const msg = templateReplace(modianTemplate, {
            id: item.nickname,
            money: item.pay_amount,
            modianname: this.modianTitle,
            // $FlowFixMe
            modianid: this.option.basic.modianId,
            goal: this.modianGoal,
            alreadyraised: alreadyRaised,
            backercount: backerCount,
            amountdifference: amountDifference,
            endtime: endTime,
            timedifference,
            chouka: `抽卡结果：\n${ choukaStr.join('\n') }${ cqImage }`
          });

          await this.sendMessage(msg);
        }
      } catch (err) {
        console.error(err);
      }
    }
  }

  // 监听信息
  async listenRoomMessage() {
    const basic = this?.option?.basic || {};
    const times = basic.liveListeningInterval ? (basic.liveListeningInterval * 1000) : 15000;

    try {
      const data2 = await requestRoomMessage(basic.roomId, '', this.kouDai48Token);

      if (!(data2.status === 200 && 'content' in data2)) {
        this.roomListenerTimer = global.setTimeout(this.listenRoomMessage.bind(this), times);

        return;
      }

      const newTime = data2.content.data[0].msgTime;

      // 新时间大于旧时间，获取25条数据
      if (!(newTime > this.roomLastTime)) {
        this.roomListenerTimer = global.setTimeout(this.listenRoomMessage.bind(this), times);

        return;
      }

      const data3 = await requestRoomMessage(
        this.option ? this.option.basic.roomId : 0,
        this.kouDai48Token,
        25
      ); // 重新获取数据

      if (!(data3.status === 200 && 'content' in data3)) {
        this.roomListenerTimer = global.setTimeout(this.listenRoomMessage.bind(this), times);

        return;
      }

      // 格式化发送消息
      const sendStr = [];
      const data = data3.content.data;

      for (let i = 0, j = data.length; i < j; i++) {
        const item = data[i];

        if (item.msgTime > this.roomLastTime) {
          const extInfo = JSON.parse(item.extInfo);
          const msgTime = time('YYYY-MM-DD hh:mm:ss', item.msgTime);
          const { messageType } = extInfo;

          switch (messageType) {
            // 普通信息
            case 'TEXT':
              sendStr.push(`${ extInfo.user.nickName }：${ extInfo.text }\n`
                         + `时间：${ msgTime }`);
              break;

            // 回复信息
            case 'REPLY':
              // const ui = await requestUserInformation(extInfo.faipaiUserId);
              sendStr.push(`${ extInfo.replyName }：${ extInfo.replyText }\n`
                         + `${ extInfo.user.nickName }：${ extInfo.text }\n`
                         + `时间：${ msgTime }`);
              break;

            // 发送图片
            case 'IMAGE':
              const imgUrl = JSON.parse(item.bodys).url;
              let txt = `${ extInfo.user.nickName }：`;

              // 判断是否是air还是pro，来发送图片或图片地址
              if (this.option && this.option.basic.isRoomSendImage && this.coolqEdition === 'pro') {
                txt += `\n[CQ:image,file=${ imgUrl }]\n`;
              } else {
                txt += `${ imgUrl }\n`;
              }

              sendStr.push(`${ txt }时间：${ msgTime }`);
              break;

              // 发送语音
            case 'AUDIO':
              const audioUrl = JSON.parse(item.bodys).url;

              sendStr.push(`${ extInfo.user.nickName } 发送了一条语音：${ audioUrl }\n`
                         + `时间：${ msgTime }`);
              // 判断是否是air还是pro，来发送语音，语音只能单独发送
              if (this.option && this.option.basic.isRoomSendRecord && this.coolqEdition === 'pro') {
                sendStr.push(`[CQ:record,file=${ audioUrl },magic=false]`);
              }
              break;

              // 发送短视频
            case 'VIDEO':
              const videoUrl = JSON.parse(item.bodys).url;

              sendStr.push(`${ extInfo.user.nickName } 发送了一个视频：${ videoUrl }\n`
                         + `时间：${ msgTime }`);
              break;

            // 直播
            case 'LIVEPUSH':
              sendStr.push(`${ extInfo.user.nickName } 正在直播\n`
                         + `直播标题：${ extInfo.liveTitle }\n`
                         + `时间：${ msgTime }`);
              break;

            // 鸡腿翻牌
            case 'FLIPCARD':
              const fanpaiInfo = await requestFlipAnswer(this.kouDai48Token, extInfo.questionId, extInfo.answerId);
              const msg = `${ extInfo.user.nickName } 翻牌了 ${ fanpaiInfo.content.userName }的问题：\n`
                        + `${ extInfo.question || fanpaiInfo.content.question }\n`
                        + `回答：${ extInfo.answer || fanpaiInfo.content.answer }`
                        + `时间：${ msgTime }`;

              sendStr.push(msg);
              break;

            // 发表情
            case 'EXPRESS':
              sendStr.push(`${ extInfo.user.nickName }：发送了一个表情。\n`
                         + `时间：${ msgTime }`);
              break;

            // debug
            default:
              sendStr.push(`${ extInfo.user.nickName }：未知信息类型，请联系开发者。\n`
                         + `时间：${ msgTime }`);
              break;
          }
        } else {
          break;
        }
      }

      // 倒序数组发送消息
      for (let i = sendStr.length - 1; i >= 0; i--) {
        await this.sendMessage(sendStr[i]);
      }
      // 更新时间节点
      this.roomLastTime = data[0].msgTime;
    } catch (err) {
      console.error(err);
    }

    this.roomListenerTimer = global.setTimeout(this.listenRoomMessage.bind(this), times);
  }

  // web worker监听到微博的返回信息
  async listenWeiboWorkerCbInformation(event) {
    const { isWeiboAtAll } = this?.option?.basic || {};

    if (event.data.type === 'change') {
      try {
        const { data } = event.data;

        // 倒序发送消息
        for (let i = data.length - 1; i >= 0; i--) {
          let item = data[i];

          // @所有人的功能
          if (isWeiboAtAll) item = `[CQ:at,qq=all] ${ item }`;

          await this.sendMessage(item);
        }
      } catch (err) {
        console.error(err);
      }
    }
  }

  // 群内定时推送消息
  async timingMessagePush(msg) {
    try {
      await this.sendMessage(msg);
    } catch (err) {
      console.error(err);
    }
  }
}

export default CoolQ;