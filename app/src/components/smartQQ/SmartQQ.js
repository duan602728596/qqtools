/* 网页版QQ登录接口 */
import { requestHttp, hash33, hash, cookieObj2Str, msgId } from './calculate';
import { templateReplace } from '../../function';
import { requestUserInformation, requestRoomMessage } from '../roomListener/roomListener';
const queryString = global.require('querystring');

type cons = {
  callback: Function
};

class SmartQQ{
  cookie: Object;
  cookieStr: ?string;
  token: ?string;
  url: ?string;
  name: ?string;
  ptwebqq: ?string;
  vfwebqq: ?string;
  uin: ?string;
  cip: ?string;
  psessionid: ?string;
  friends: ?Array;
  gnamelist: ?Array;
  groupItem: ?Object;
  loginBrokenLineReconnection: ?number;
  listenMessageTimer: ?number;
  callback: Function;
  option: Object;

  modianTitle: ?string;
  modianWorker: ?Worker;
  members: ?RegExp;
  roomListenerTimer: ?number;
  roomLastTime: ?number;
  kouDai48Token: ?string;

  constructor({ callback }: cons): void{
    // QQ登录相关
    this.cookie = {};            // 储存cookie
    this.cookieStr = null;       // cookie字符串
    this.token = null;           // 二维码登录令牌
    this.url = null;             // 登录的url
    this.name = null;            // 登录的用户名
    this.ptwebqq = null;
    this.vfwebqq = null;
    this.uin = null;
    this.cip = null;
    this.psessionid = null;
    // QQ获取列表
    this.friends = null;         // 获取在线好友列表
    this.gnamelist = null;       // 群列表
    this.groupItem = null;       // 群信息
    // QQ机器人配置相关
    this.loginBrokenLineReconnection = null;  // 重新登录的定时器
    this.listenMessageTimer = null;           // 轮询信息
    this.callback = callback;    // 获得信息后的回调
    this.option = null;          // 配置信息

    /* === 从此往下是业务相关 === */

    // 摩点项目相关
    this.modianTitle = null;     // 摩点项目标题
    this.modianWorker = null;    // 摩点新线程
    // 口袋48监听相关
    this.members = null;         // 监听指定成员
    // 房间信息监听相关
    this.roomListenerTimer = null;  // 轮询定时器
    this.roomLastTime = null;       // 最后一次发言
    this.kouDai48Token = null;      // token
  }
  // 下载二维码
  downloadPtqr(timeStr): Promise{
    return requestHttp({
      reqUrl: `https://ssl.ptlogin2.qq.com/ptqrshow?appid=501004106&e=0&l=M&s=5&d=72&v=4&t=${ Math.random() }`
    });
  }
  // 计算令牌
  getToken(): void{
    const qrsig: string = this.cookie['qrsig'];
    const token33: string = hash33(qrsig);
    this.token = token33;
  }
  // 判断是否在登录状态
  isLogin(): Promise{
    return requestHttp({
      reqUrl: `https://ssl.ptlogin2.qq.com/ptqrlogin?webqq_type=10&remember_uin=1&login2qq=1&aid=501004106&u1=http%3A%2F%2Fw.qq.com%2Fproxy.html%3Flogin2qq%3D1%26webqq_type%3D10&ptredirect=0&ptlang=2052&daid=164&from_ui=1&pttype=1&dumy=&fp=loginerroralert&action=0-0-2105&mibao_css=m_webqq&t=undefined&g=1&js_type=0&js_ver=10220&login_sig=&pt_randsalt=0&ptqrtoken=${ this.token }`,
      headers: {
        'Cookie': cookieObj2Str(this.cookie)
      },
      setEncode: 'utf8'
    })
  }
  // 登录
  login(): Promise{
    return requestHttp({
      reqUrl: this.url,
      headers: {
        'Cookie': cookieObj2Str(this.cookie)
      },
      setEncode: 'utf8'
    });
    // login之后的两个302重定向页面
    // http://w.qq.com/proxy.html?login2qq=1&webqq_type=10
    // http://web2.qq.com/web2_cookie_proxy.html
  }
  login302proxy(): Promise{
    return requestHttp({
      reqUrl: `http://w.qq.com/proxy.html?login2qq=1&webqq_type=10`,
      headers: {
        'Cookie': cookieObj2Str(this.cookie)
      },
      setEncode: 'utf8'
    });
  }
  login302web2(): Promise{
    return requestHttp({
      reqUrl: `http://web2.qq.com/web2_cookie_proxy.html`,
      headers: {
        'Cookie': cookieObj2Str(this.cookie)
      },
      setEncode: 'utf8'
    });
  }
  // 获取vfwebqq
  getVfWebQQ(): Promise{
    const u: string = `http://s.web2.qq.com/api/getvfwebqq?clientid=53999199&psessionid=&t=${ Math.random() * 10 ** 16 }&ptwebqq=${ this.cookie.ptwebqq }`;
    return requestHttp({
      reqUrl: u,
      headers: {
        'Cookie': cookieObj2Str(this.cookie),
        'Referer': 'http://s.web2.qq.com/proxy.html?v=20130916001&callback=1&id=1'
      },
      setEncode: 'utf8'
    });
  }
  // 获取psessionid、uin和cip
  getPsessionAndUinAndCip(): Promise{
    const data: string = queryString.stringify({
      r: JSON.stringify({
        ptwebqq: this.ptwebqq,
        clientid: 53999199,
        psessionid: '',
        status: 'online'
      })
    });
    return requestHttp({
      reqUrl: `http://d1.web2.qq.com/channel/login2`,
      headers: {
        'Cookie': cookieObj2Str(this.cookie),
        'Referer': 'http://d1.web2.qq.com/proxy.html?v=20151105001&callback=1&id=2'
      },
      method: 'POST',
      setEncode: 'utf8',
      data
    });
  }
  // 获取群组
  getGroup(): Promise{
    const data: string = queryString.stringify({
      r: JSON.stringify({
        vfwebqq: `${ this.vfwebqq }`,
        hash: hash(this.uin, this.ptwebqq)
      })
    });
    return requestHttp({
      reqUrl: `https://s.web2.qq.com/api/get_group_name_list_mask2`,
      headers: {
        'Cookie': cookieObj2Str(this.cookie),
        'Referer': 'http://s.web2.qq.com/proxy.html?v=20130916001&callback=1&id=1',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      method: 'POST',
      setEncode: 'utf8',
      data
    });
  }
  // 获取群好友
  getFriends(): Promise{
    return requestHttp({
      reqUrl: `http://d1.web2.qq.com/channel/get_online_buddies2?vfwebqq=${ this.vfwebqq }&clientid=53999199` +
              `&psessionid=${ this.psessionid }&t=${ new Date().getTime() }`,
      headers: {
        'Cookie': cookieObj2Str(this.cookie),
        'Referer': 'http://d1.web2.qq.com/proxy.html?v=20151105001&callback=1&id=2'
      },
      setEncode: 'utf8'
    });
  }
  // 获取群详细信息
  getGroupItem(): void{
    for(const index: number in this.gnamelist){
      const item: Object = this.gnamelist[index];
      if(item['name'] === this.option.groupName){
        this.groupItem = item;
        break;
      }
    }
  }
  // 将cookie转换成字符串
  cookie2Str(): void{
    const cs: string = cookieObj2Str(this.cookie);
    this.cookieStr = cs;
  }
  // 验证成功后的一系列执行事件
  async loginSuccess(cb: Function): void{
    // 登录
    const [data1, cookies1]: [string, Object] = await this.login();
    this.cookie = Object.assign(this.cookie, cookies1);
    await this.login302proxy();
    await this.login302web2();
    // 获得vfwebqq
    const [data2]: [string] = await this.getVfWebQQ();
    this.vfwebqq = JSON.parse(data2).result.vfwebqq;
    // 获取psessionid、uin和cip
    const [data3]: [string] = await this.getPsessionAndUinAndCip();
    const { result }: { result: Object } = JSON.parse(data3);
    this.psessionid = result.psessionid;
    this.uin = result.uin;
    this.cip = result.cip;
    // 获取群组
    const [data4]: [string] = await this.getGroup();
    this.gnamelist = JSON.parse(data4).result.gnamelist;
    // 获取在线好友列表
    const [data5]: [string] = await this.getFriends();
    this.friends = JSON.parse(data5).result;
    // 获取群信息，转换cookie
    this.getGroupItem();
    this.cookie2Str();
    // 回调函数
    if(cb) cb();
  }
  // 获取消息
  getMessage(): Promise{
    const data: string = queryString.stringify({
      r: JSON.stringify({
        ptwebqq: this.ptwebqq,
        clientid: 53999199,
        psessionid: this.psessionid,
        key: ''
      })
    });
    return requestHttp({
      reqUrl: `https://d1.web2.qq.com/channel/poll2`,
      headers: {
        'Cookie': this.cookieStr,
        'Referer': 'https://d1.web2.qq.com/cfproxy.html?v=20151105001&callback=1',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Host': 'd1.web2.qq.com',
        'Origin': 'https://d1.web2.qq.com'
      },
      method: 'POST',
      setEncode: 'utf8',
      data,
      timeout: 5000  // 设置5秒超时
    });
  }
  // 发送消息
  sendMessage(message: string): Promise{
    const data: string = queryString.stringify({
      r: JSON.stringify({
        group_uin: this.groupItem.gid,
        content: JSON.stringify([
          message,
          [
            'font',
            {
              name: '宋体',
              size: 10,
              style: [0, 0, 0],
              color: '000000'
            }
          ]
        ]),
        face: 333,
        clientid: 53999199,
        msg_id: msgId(),
        psessionid: this.psessionid
      })
    });
    return requestHttp({
      reqUrl: `https://d1.web2.qq.com/channel/send_qun_msg2`,
      headers: {
        'Cookie': this.cookieStr,
        'Referer': 'https://d1.web2.qq.com/cfproxy.html?v=20151105001&callback=1',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      method: 'POST',
      setEncode: 'utf8',
      data
    });
  }
  // 轮询事件
  async listenMessage(){
    try{
      const [data]: [string] = await this.getMessage();
      this.callback(JSON.parse(data), this);
    }catch(err){
      console.error('轮询', err);
    }
    const t1: number = global.setTimeout(this.listenMessage.bind(this), 500);
    this.listenMessageTimer = t1;
  }
  // 分段发送消息，最多发送十八行，防止多段的消息发送不出去
  async sendFormatMessage(message): void{
    const msgArr: string[] = message.split(/\n/g);
    const sendMsg: string[] = [];
    const len: number = msgArr.length;
    let i: number = 0;
    while(i < len){
      const len2: number = i + 18;
      const arr: string[] = [];
      for(let i1: number = i; i1 < (len2 >= len ? len : len2 ); i1++){
        arr.push(msgArr[i1]);
      }
      const str: string = arr.join('\n');
      sendMsg.push(str);
      i = len2;
    }
    // 分段发送消息
    for(let i2: number = 0, j2 = sendMsg.length; i2 < j2; i2++ ){
      await this.sendMessage(sendMsg[i2]);
    }
  }
  // 获取群成员信息
  getGroupMinfo(): Promise{
    const url: string = `http://s.web2.qq.com/api/get_group_info_ext2?` +
      `gcode=${ this.groupItem.code }&vfwebqq=${ this.vfwebqq }&t={ ${ Math.random() } }`;
    return requestHttp({
      reqUrl: url,
      headers: {
        'Cookie': this.cookieStr,
        'Referer': 'http://s.web2.qq.com/proxy.html?v=20130916001&callback=1&id=1'
      },
      method: 'GET',
      setEncode: 'utf8',
      timeout: 20000  // 设置15秒超时
    });
  }

  /* === 从此往下是业务相关 === */

  // web worker监听到微打赏的返回信息
  async listenModianWorkerCbInformation(event: Event): void{
    if(event.data.type === 'change'){
      const { data }: { data: Array } = event.data;
      const { modianTemplate }: { modianTemplate: string } = this.option.basic;
      // 倒序发送消息
      for(let i: number = data.length - 1; i >= 0; i--){
        const item: Object = data[i];
        const msg: string = templateReplace(modianTemplate, {
          id: item.nickname,
          money: item.pay_amount,
          modianname: this.modianTitle,
          modianid: this.option.basic.modianId
        });
        await this.sendFormatMessage(msg);
      }
    }
  }
  // 监听信息
  async listenRoomMessage(): void{
    try{
      const data2: Object = await requestRoomMessage(this.option.basic.roomId, this.kouDai48Token);
      if(data2.status === 200 && 'content' in data2){
        const newTime: number = data2.content.data[0].msgTime;
        // 新时间大于旧时间，获取数据20条
        if(newTime > this.roomLastTime){
          const data3: Object = await requestRoomMessage(this.option.basic.roomId, this.kouDai48Token, 25);  // 重新获取数据
          if(data3.status === 200 && 'content' in data3){
            // 格式化发送消息
            const sendStr: string[] = [];
            const data: Array = data3.content.data;
            for(let i: number = 0, j: number = data.length; i < j; i++){
              const item: Object = data[i];
              if(item.msgTime > this.roomLastTime){
                const extInfo: Object = JSON.parse(item.extInfo);
                switch(extInfo.messageObject){
                  // 普通信息
                  case 'text':
                    sendStr.push(`${ extInfo.senderName }：${ extInfo.text }\n` +
                                 `时间：${ item.msgTimeStr }`);
                    break;
                  // 翻牌信息
                  case 'faipaiText':
                    const ui: Object = await requestUserInformation(extInfo.faipaiUserId);
                    sendStr.push(`${ ui.content.userInfo.nickName }：${ extInfo.faipaiContent }\n` +
                                 `${ extInfo.senderName }：${ extInfo.messageText }\n` +
                                 `时间：${ item.msgTimeStr }`);
                    break;
                  // 发送图片
                  case 'image':
                    const url: string = JSON.parse(item.bodys).url;
                    sendStr.push(`${ extInfo.senderName }：${ url }\n` +
                                 `时间：${ item.msgTimeStr }`);
                    break;
                  // 直播
                  case 'live':
                    sendStr.push(`${ extInfo.senderName }正在直播\n` +
                                 `直播间：${ extInfo.referenceTitle }\n` +
                                 `直播标题：${ extInfo.referenceContent }\n` +
                                 `时间：${ item.msgTimeStr }`);
                    break;
                }
              }else{
                break;
              }
            }
            // 倒序数组发送消息
            for(let i: number = sendStr.length - 1; i >= 0; i--){
              await this.sendFormatMessage(sendStr[i]);
            }
            // 更新时间节点
            this.roomLastTime = data[0].msgTime;
          }
        }
      }
    }catch(err){
      console.error(err);
    }
    this.roomListenerTimer = global.setTimeout(this.listenRoomMessage.bind(this), 15000);
  }
}

export default SmartQQ;