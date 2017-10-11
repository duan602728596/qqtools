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
import option from '../../publishMethod/option';
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

class Index extends Component{
  state: {
    imgUrl: ?string
  };
  constructor(props: Object): void{
    super(props);

    this.state = {
      imgUrl: null   // 图片地址
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
      // 获取在线好友列表
      const [data4, cookies4]: [string, Object] = await qq.getGroup();
      console.log(data4, cookies4);

    }catch(err){
      console.error('登录错误', err);
      message.error('登录失败！');
    }
  }
  async componentDidMount(): void{
    // 初始化QQ
    try{
      qq = new SmartQQ();
      const [data, cookies]: [Buffer, Object] = await qq.downloadPtqr();
      qq.cookie = cookies;
      // 写入图片
      await writeImage(option.ptqr, data);
      this.setState({
        imgUrl: option.ptqr
      });
      // 计算令牌
      qq.getToken();
      // 轮询查看是否登录
      timer = setInterval(async ()=>{
        const [x, cookies2]: [string, Object] = await qq.isLogin();
        const status: string[] = x.split(/[()',]/g); // 2：登陆状态，17：姓名，8：登录地址

        if(status[2] === '65'){
          // 失效，重新获取二维码
          const [dataReset, cookiesReset]: [Buffer, Object] = await qq.downloadPtqr();
          qq.cookie = cookiesReset;
          await writeImage(option.ptqr, dataReset);
          this.setState({
            imgUrl: option.ptqr
          });
        }else if(status[2] === '0'){
          // 登陆成功
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
  render(): Object{
    return (
      <div className={ style.body }>
        <div className={ style.ptqrBody }>
          {
            this.state.imgUrl ? (
              <img className={ style.ptqr } src={ this.state.imgUrl } alt="登录二维码" title="登录二维码" />
            ) : (
              <Spin className={ style.ptqr } tip="正在加载二维码..." />
            )
          }
        </div>
        <p className={ style.tishi }>请用手机QQ扫描登录</p>
        <Link to="/">返回</Link>
      </div>
    );
  }
}

export default Index;