// @flow
/* 网页版QQ登录接口 */
import { request, hash33, hash, cookieObj2Str } from './function';
const queryString = node_require('querystring');

class SmartQQ{
  cookie: Object;
  token: ?string;
  url: ?string;
  name: ?string;
  ptwebqq: ?string;
  vfwebqq: ?string;
  uin: ?string;
  cip: ?string;
  psessionid: ?string;
  gnamelist: ?Array;
  friends: ?Array;
  groupname: string;
  constructor(groupname: string): void{
    this.cookie = {};            // 储存cookie
    this.token = null;           // 二维码登录令牌
    this.url = null;             // 登录的url
    this.name = null;            // 登录的用户名
    this.ptwebqq = null;
    this.vfwebqq = null;
    this.uin = null;
    this.cip = null;
    this.psessionid = null;
    this.gnamelist = null;       // 群列表
    this.friends = null;         // 获取在线好友列表
    this.groupname = groupname;  // 群名称
  }
  // 下载二维码
  downloadPtqr(): Promise{
    return request({
      reqUrl: `https://ssl.ptlogin2.qq.com/ptqrshow?appid=501004106&e=0&l=M&s=5&d=72&v=4&t=${ new Date().getTime() }`
    });
  }
  // 计算令牌
  getToken(): void{
    const qrsig: string = this.cookie['qrsig'];
    this.token = hash33(qrsig);
  }
  // 判断是否在登录状态
  isLogin(): Promise{
    return request({
      reqUrl: `https://ssl.ptlogin2.qq.com/ptqrlogin?webqq_type=10&remember_uin=1&login2qq=1&aid=501004106&u1=http%3A%2F%2Fw.qq.com%2Fproxy.html%3Flogin2qq%3D1%26webqq_type%3D10&ptredirect=0&ptlang=2052&daid=164&from_ui=1&pttype=1&dumy=&fp=loginerroralert&action=0-0-2105&mibao_css=m_webqq&t=undefined&g=1&js_type=0&js_ver=10220&login_sig=&pt_randsalt=0&ptqrtoken=${ this.token }`,
      headers: {
        'Cookie': cookieObj2Str(this.cookie)
      },
      setEncode: 'utf8'
    })
  }
  // 登录
  login():Promise{
    return request({
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
  login302proxy(){
    return request({
      reqUrl: `http://w.qq.com/proxy.html?login2qq=1&webqq_type=10`,
      headers: {
        'Cookie': cookieObj2Str(this.cookie)
      },
      setEncode: 'utf8'
    });
  }
  login302web2(){
    return request({
      reqUrl: `http://web2.qq.com/web2_cookie_proxy.html`,
      headers: {
        'Cookie': cookieObj2Str(this.cookie)
      },
      setEncode: 'utf8'
    });
  }
  // 获取vfwebqq
  getVfWebQQ(){
    const u: string = `http://s.web2.qq.com/api/getvfwebqq?clientid=53999199&psessionid=&t=${ Math.random() * 10 ** 16 }&ptwebqq=${ this.cookie.ptwebqq }`;
    return request({
      reqUrl: u,
      headers: {
        'Cookie': cookieObj2Str(this.cookie),
        'Referer': 'http://s.web2.qq.com/proxy.html?v=20130916001&callback=1&id=1'
      },
      setEncode: 'utf8'
    });
  }
  // 获取psessionid、uin和cip
  getPsessionAndUinAndCip(){
    const data: string = queryString.stringify({
      r: JSON.stringify({
        ptwebqq: this.ptwebqq,
        clientid: 53999199,
        psessionid: '',
        status: 'online'
      })
    });
    return request({
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
  getGroup(){
    const data: string = queryString.stringify({
      r: JSON.stringify({
        vfwebqq: `${ this.vfwebqq }`,
        hash: hash(this.uin, this.ptwebqq)
      })
    });

    console.log(data);
    console.log(cookieObj2Str(this.cookie));

    return request({
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
}

export default SmartQQ;