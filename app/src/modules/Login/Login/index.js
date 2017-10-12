// @flow
/* 登录页 */
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { createSelector, createStructuredSelector } from 'reselect';
import { Spin, message } from 'antd';
import { Link } from 'react-router-dom';
import style from './style.sass';
import SmartQQ from '../../../components/smartQQ/SmartQQ';
import option from '../../publicMethod/option';
const fs = node_require('fs');

let qq: ?SmartQQ = null;
let timer: ?number = null;

/**
 * 写入文件
 * @param { string } file: 文件地址
 * @param { Buffer } data: 图片二进制流
 * @return { Promise }
 */
function writeImage(file: string, data: Buffer): Promise{
  return new Promise((resolve: Function, reject: Function): void=>{
    fs.writeFile(file, data, (err: any): void=>{
      if(err){
        reject();
      }else{
        resolve();
      }
    });
  });
}

class Login extends Component{
  state: {
    imgUrl: ?string,
    loginState: number
  };
  constructor(props: Object): void{
    super(props);

    this.state = {
      imgUrl: null,   // 图片地址
      loginState: 0   // 登录状态，0：加载二维码，1：二维码加载完毕，2：登陆中
    };
  }
  async loginSuccess(): void{
    try{
      // 登录
      const [data1, cookies1]: [string, Object] = await qq.login();
      qq.cookie = Object.assign(qq.cookie, cookies1);
      await qq.login302proxy();
      await qq.login302web2();
      // 获得vfwebqq
      const [data2, cookies2]: [string, Object] = await qq.getVfWebQQ();
      qq.vfwebqq = JSON.parse(data2).result.vfwebqq;
      // 获取psessionid、uin和cip
      const [data3, cookies3]: [string, Object] = await qq.getPsessionAndUinAndCip();
      const { result }: { result: Object } = JSON.parse(data3);
      qq.psessionid = result.psessionid;
      qq.uin = result.uin;
      qq.cip = result.cip;
      // 获取群组
      const [data4, cookies4]: [string, Object] = await qq.getGroup();
      qq.gnamelist = JSON.parse(data4).result.gnamelist;
      // 获取在线好友列表
      const [data5, cookies5]: [string, Object] = await qq.getFriends();
      qq.friends = JSON.parse(data5).result;
      // 获取群信息，转换cookie
      qq.getGroupItem();
      qq.cookie2Str();
      // 测试
      // {
      //   const a = await qq.getMessage();
      //   console.log(a[0]);
      //   const b = await qq.sendMessage('大家好！');
      //   console.log(b[0]);
      // }

    }catch(err){
      console.error('登录错误', err);
      message.error('登录失败！');
    }
  }
  async componentDidMount(): void{
    // 初始化QQ
    try{
      qq = new SmartQQ('群主很懒');
      const [data, cookies]: [Buffer, Object] = await qq.downloadPtqr();
      qq.cookie = cookies;
      // 写入图片
      await writeImage(option.ptqr, data);
      // 计算令牌
      qq.getToken();
      this.setState({
        imgUrl: option.ptqr,
        loginState: 1
      });
      // 轮询查看是否登录
      timer = setInterval(async ()=>{
        const [x, cookies2]: [string, Object] = await qq.isLogin();
        const status: string[] = x.split(/[()',]/g); // 2：登陆状态，17：姓名，8：登录地址

        if(status[2] === '65'){
          // 失效，重新获取二维码
          const [dataReset, cookiesReset]: [Buffer, Object] = await qq.downloadPtqr();
          qq.cookie = cookiesReset;
          await writeImage(option.ptqr, dataReset);
          qq.getToken();
          this.setState({
            imgUrl: option.ptqr
          });
        }else if(status[2] === '0'){
          // 登陆成功
          this.setState({
            imgUrl: option.ptqr,
            loginState: 2
          });
          qq.url = status[8];
          qq.name = status[17];
          qq.cookie = Object.assign(qq.cookie, cookies2);
          qq.ptwebqq = qq.cookie.ptwebqq;
          clearInterval(timer);
          timer = null;
          this.loginSuccess();
        }
      }, 500);
    }catch(err){
      console.error('登录错误', err);
      message.error('初始化失败！');
    }
  }
  componentWillUnmount(): void{
    if(timer) clearInterval(timer); // 清除定时器
    if(qq) qq = null;               // 清除qq相关
  }
  ptqrBody(){
    switch(this.state.loginState){
      case 0:
        return (
          <Spin className={ style.ptqr } tip="正在加载二维码..." />
        );
      case 1:
        return (
          <img className={ style.ptqr } src={ this.state.imgUrl } alt="登录二维码" title="登录二维码" />
        );
      case 2:
        return (
          <Spin className={ style.ptqr } tip="登陆中...">
            <img className={ `${ style.ptqr } ${ style.o }` } src={ this.state.imgUrl } alt="登录二维码" title="登录二维码" />
          </Spin>
        );
    }
  }
  render(): Object{
    return (
      <div className={ style.body }>
        <div className={ style.ptqrBody }>
          { this.ptqrBody() }
        </div>
        <p className={ style.tishi }>
          请用手机QQ扫描登录，或者
          <Link to="/Login">返回</Link>
        </p>
      </div>
    );
  }
}

export default Login;