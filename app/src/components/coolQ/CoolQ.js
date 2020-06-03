import { message } from 'antd';
import chunk from 'lodash-es/chunk';
import { requestRoomMessage, requestFlipAnswer } from '../kd48listerer/roomListener';
import { time } from '../../utils';
import { chouka } from '../chouka/chouka';
import * as storagecard from '../chouka/storagecard';
import bestCards from '../chouka/bestCards';
import getLevelPoint from '../chouka/getLevelPoint';
const nunjucks = global.require('nunjucks');

export const APP_KEY = '***REMOVED***';

class CoolQ {
  constructor(qq, port, callback) {
    this.time = null; // 登录时间戳
    this.qq = qq;     // qq号
    this.port = port; // socket端口
    this.isError = false;                                   // 判断是否错误
    this.eventUrl = `ws://127.0.0.1:${ this.port }/event/`; // 地址
    this.eventSocket = null;     // socket
    this.isEventSuccess = false; // 判断是否连接成功
    this.apiUrl = `ws://127.0.0.1:${ this.port }/api/`; // 地址
    this.apiSocket = null;     // socket
    this.isApiSuccess = false; // 判断是否连接成功
    this.callback = callback;  // 获得信息后的回调
    this.coolqEdition = 'air'; // 酷Q的版本

    this.option = null; // 配置
    // 摩点项目相关
    this.modianTitle = null;  // 摩点项目标题
    this.modianGoal = null;   // 摩点项目目标
    this.moxiId = null;       // moxi_id
    this.modianWorker = null; // 摩点新线程
    this.choukaJson = null;   // 抽卡配置
    this.bukaQQNumber = null; // 允许群里补卡的qq号
    // 口袋48监听相关
    this.members = null;  // 监听指定成员
    this.memberId = null; // 坚听成员id
    // 房间信息监听相关
    this.roomListenerTimer = null; // 轮询定时器
    this.kouDai48UserId = null;    // 用户id
    this.nimChatroomSocket = null; // 口袋48sdk监听
    // 微博监听相关
    this.weiboWorker = null; // 微博监听新线程
    // 绿洲
    this.lvzhouWorker = null; // 绿洲监听新线程
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

      this.sendMessage(nunjucks.renderString(this.option ? this.option.basic.welcomeNewGroupMember : '', {
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
  sendMessage(messageStr) {
    const groupNumber = Number(this.option.groupNumber);
    const messageArr = messageStr.split(/\[qqtools:stage\]/g);

    for (const item of messageArr) {
      this.apiSocket.send(JSON.stringify({
        action: 'send_group_msg',
        params: {
          group_id: groupNumber,
          message: item
        }
      }));
    }
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

    this.eventSocket.addEventListener('open', this.handleOpenEventSocket, false);
    this.eventSocket.addEventListener('error', this.handleEventSocketError, false);
    this.eventSocket.addEventListener('message', this.handleListenerEventMessage, false);

    // api
    this.apiSocket = new WebSocket(this.apiUrl);

    this.apiSocket.addEventListener('open', this.handleOpenApiSocket, false);
    this.apiSocket.addEventListener('error', this.handleApiSocketError, false);
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
    if (this.nimChatroomSocket !== null) {
      this.nimChatroomSocket.disconnect();
      this.nimChatroomSocket = null;
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

    // 删除绿洲的web worker
    if (this.lvzhouWorker) {
      this.lvzhouWorker.postMessage({
        type: 'cancel'
      });
      // $FlowFixMe
      this.lvzhouWorker.terminate();
      this.lvzhouWorker = null;
    }

    // 删除群消息推送定时器
    if (this.timingMessagePushTimer) {
      this.timingMessagePushTimer.cancel();
    }

    // --- 关闭socket ---
    // event
    this.eventSocket.removeEventListener('open', this.handleOpenEventSocket);
    this.eventSocket.removeEventListener('error', this.handleEventSocketError);
    this.eventSocket.removeEventListener('message', this.handleListenerEventMessage);

    // api
    this.apiSocket.removeEventListener('open', this.handleOpenApiSocket);
    this.apiSocket.removeEventListener('error', this.handleApiSocketError);
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
        const { cards, money, multiple, db, sendImageLength, resetCardsToPoints } = this.choukaJson || {};
        const levelPoint = cards ? getLevelPoint(cards) : {}; // 格式化等级对应的分数

        // 倒序发送消息
        for (let i = data.length - 1; i >= 0; i--) {
          const item = data[i];

          // 抽卡
          const choukaStr = [];
          let cqImage = '';
          let cardsPointsMsg = '';

          if (isChouka) {
            // 把卡存入数据库
            const kaResult = await storagecard.query(db, item.userid);
            const record = kaResult.length === 0 ? {} : JSON.parse(kaResult[0].record);
            let cardsPoints = 0; // 积分
            const choukaResult = chouka(cards, money, Number(item.pay_amount), multiple);

            for (const key in choukaResult) {
              const item2 = choukaResult[key];
              const str = `【${ item2.level }】${ item2.name } * ${ item2.length }`;

              choukaStr.push(str);

              if (resetCardsToPoints) {
                // 转换成积分
                if (item2.id in record) {
                  // 有重复的卡片
                  cardsPoints += levelPoint[item2.level] * item2.length;
                } else {
                  // 新卡片
                  record[item2.id] = 1;
                  cardsPoints += levelPoint[item2.level] * (item2.length - 1);
                }
              } else {
                // 不转换成积分
                if (item2.id in record) {
                  // 有重复的卡片
                  record[item2.id] += item2.length;
                } else {
                  // 新卡片
                  record[item2.id] = item2.length;
                }
              }
            }

            if (resetCardsToPoints) {
              cardsPointsMsg = `\n已经将重复的卡片转换成积分：${ cardsPoints }。`;
            }

            if (isChoukaSendImage && this.coolqEdition === 'pro') {
              // 发送所有图片
              const cqArr = [];

              if (sendImageLength === undefined || sendImageLength === null) {
                for (const key in choukaResult) {
                  cqArr.push(`[CQ:image,file=${ choukaResult[key].image }]`);
                }
              } else {
                cqArr.push(...bestCards(cards, sendImageLength === 0 ? Object.values(choukaResult).length : sendImageLength));
              }

              const chunkArr = chunk(cqArr, 10);
              const sendArr = [];

              for (const item of chunkArr) {
                sendArr.push(item.join(''));
              }

              cqImage += sendArr.join('[qqtools:stage]');
            }

            // 把卡存入数据库
            if (kaResult.length === 0) {
              await storagecard.insert(db, item.userid, item.nickname, record, cardsPoints);
            } else {
              await storagecard.update(db, item.userid, item.nickname, record, (kaResult[0].points || 0) + cardsPoints);
            }
          }

          const msg = nunjucks.renderString(modianTemplate, {
            id: item.nickname,
            money: item.pay_amount,
            modianname: this.modianTitle,
            modianid: this.option.basic.modianId,
            goal: this.modianGoal,
            alreadyraised: alreadyRaised,
            backercount: backerCount,
            amountdifference: amountDifference,
            endtime: endTime,
            timedifference,
            chouka: `${ choukaStr.length === 0 ? '' : '抽卡结果：\n' }${ choukaStr.join('\n') }${ cardsPointsMsg }${ cqImage }`
          });

          await this.sendMessage(msg);
        }
      } catch (err) {
        console.error(err);
      }
    }
  }

  // 进入房间成功
  handleRoomSocketConnect = (event) => {
    console.log('进入聊天室', event);
    message.success('口袋48房间监听已就绪。');
  };

  // 进入房间失败
  handleRoomSocketError = (error, event) => {
    console.log('发生错误', error, event);
    message.error('口袋48房间监听错误。');
  };

  // 房间信息监听
  roomSocketMessage = async (event) => {
    const data = event[0];                   // 房间信息数组
    const extInfo = JSON.parse(data.custom); // 房间自定义信息
    const { messageType, sessionRole } = extInfo; // 信息类型和sessionRole
    const msgTime = time('YY-MM-DD hh:mm:ss', data.userUpdateTime); // 发送信息
    const sendStr = [];                      // 发送数据

    if (sessionRole === 0) return; // 过滤非房间信息

    try {
      const nickName = extInfo?.user?.nickName ?? ''; // 用户名

      switch (messageType) {
        // 普通信息
        case 'TEXT':
          sendStr.push(`${ nickName }：${ extInfo.text }\n`
                     + `时间：${ msgTime }`);
          break;

        // 回复信息
        case 'REPLY':
          sendStr.push(`${ extInfo.replyName }：${ extInfo.replyText }\n`
                     + `${ nickName }：${ extInfo.text }\n`
                     + `时间：${ msgTime }`);
          break;

        // 发送图片
        case 'IMAGE':
          const imgUrl = JSON.parse(item.bodys).url;
          let txt = `${ nickName }：`;

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

          sendStr.push(`${ nickName } 发送了一条语音：${ audioUrl }\n`
                     + `时间：${ msgTime }`);

          // 判断是否是air还是pro，来发送语音，语音只能单独发送
          if (this.option && this.option.basic.isRoomSendRecord && this.coolqEdition === 'pro') {
            sendStr.push(`[CQ:record,file=${ audioUrl },magic=false]`);
          }

          break;

        // 发送短视频
        case 'VIDEO':
          const videoUrl = JSON.parse(item.bodys).url;

          sendStr.push(`${ nickName } 发送了一个视频：${ videoUrl }\n`
                     + `时间：${ msgTime }`);
          break;

        // 直播
        case 'LIVEPUSH':
          sendStr.push(`${ nickName } 正在直播\n`
                     + `直播标题：${ extInfo.liveTitle }\n`
                     + `时间：${ msgTime }`);
          break;

        // 鸡腿翻牌
        case 'FLIPCARD':
          const fanpaiInfo = await requestFlipAnswer(this.kouDai48Token, extInfo.questionId, extInfo.answerId);
          const msg = `${ nickName } 翻牌了 ${ fanpaiInfo.content.userName }的问题：\n`
                    + `${ extInfo.question ?? fanpaiInfo.content.question }\n`
                    + `回答：${ extInfo.answer ?? fanpaiInfo.content.answer }\n`
                    + `时间：${ msgTime }`;

          sendStr.push(msg);
          break;

        // 发表情
        case 'EXPRESS':
          sendStr.push(`${ nickName }：发送了一个表情。\n`
                     + `时间：${ msgTime }`);
          break;

        // debug
        default:
          sendStr.push(`${ nickName }：未知信息类型，请联系开发者。\n`
                     + `数据：${ data.custom }\n`
                     + `时间：${ msgTime }`);
          break;
      }

      // 发送数据
      for (let i = sendStr.length - 1; i >= 0; i--) {
        await this.sendMessage(sendStr[i]);
      }
    } catch (err) {
      sendStr.push('信息发送错误：\n'
                 + `数据：${ data.custom }\n`
                 + `时间：${ msgTime }`);

      // 发送错误的数据信息
      for (let i = sendStr.length - 1; i >= 0; i--) {
        await this.sendMessage(sendStr[i]);
      }
    }
  };

  handleRoomSocketMessage = (event) => {
    this.roomSocketMessage(event);
  };

  // web worker监听到微博的返回信息
  async listenWeiboWorkerCbInformation(event) {
    const { isWeiboAtAll } = this?.option?.basic || {};

    if (event.data.type === 'change') {
      try {
        const { data } = event.data;

        // 倒序发送消息
        for (let i = data.length - 1; i >= 0; i--) {
          const item = data[i];
          let txt = item.data;

          // @所有人的功能
          if (isWeiboAtAll) txt = `[CQ:at,qq=all] ${ txt }`;

          // 发送图片
          if (this.option && this.option.basic.isWeiboSendImage && this.coolqEdition === 'pro' && item.pics.length > 0) {
            txt += `[CQ:image,file=${ item.pics[0] }]`;
          }

          await this.sendMessage(txt);
        }
      } catch (err) {
        console.error(err);
      }
    }
  }

  // web worker监听到绿洲的返回信息
  async listenLvzhouWorkerCbInformation(event) {
    const { isLvzhouAtAll } = this?.option?.basic || {};

    if (event.data.type === 'change') {
      try {
        const { data } = event.data;

        // 倒序发送消息
        for (let i = data.length - 1; i >= 0; i--) {
          const item = data[i];
          let txt = item.data;

          // @所有人的功能
          if (isLvzhouAtAll) txt = `[CQ:at,qq=all] ${ txt }`;

          // 发送图片
          if (this.option && this.option.basic.isLvzhouSendImage && this.coolqEdition === 'pro' && item.pics.length > 0) {
            txt += `[CQ:image,file=${ item.pics[0] }]`;
          }

          await this.sendMessage(txt);
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