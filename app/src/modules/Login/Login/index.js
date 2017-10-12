// @flow
/* 登录页 */
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import { createSelector, createStructuredSelector } from 'reselect';
import { Spin, message } from 'antd';
import style from './style.sass';
import SmartQQ from '../../../components/smartQQ/SmartQQ';
import option from '../../publicMethod/option';
import { changeQQLoginList } from '../store/reducer';
import callback from '../../../components/callback/index';
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
    fs.writeFile(file, data, {
      flags: 'w+'
    }, (err: any): void=>{
      if(err){
        reject();
      }else{
        resolve();
      }
    });
  });
}

/* 初始化数据 */
const state: Function = createStructuredSelector({
  qqLoginList: createSelector(         // 已登录
    (state: Object): Object | Array=>state.has('login') ? state.get('login').get('qqLoginList') : [],
    (data: Object | Array): Array=>data instanceof Array ? data : data.toJS()
  )
});

/* dispatch */
const dispatch: Function = (dispatch: Function): Object=>({
  action: bindActionCreators({
    changeQQLoginList
  }, dispatch)
});

@withRouter
@connect(state, dispatch)
class Login extends Component{
  state: {
    imgUrl: ?string,
    loginState: number,
    qq: ?SmartQQ,
    timer: ?number
  };
  constructor(props: Object): void{
    super(props);

    this.state = {
      imgUrl: null,    // 图片地址
      loginState: 0,   // 登录状态，0：加载二维码，1：二维码加载完毕，2：登陆中
      qq: null,
      timer: null
    };
  }
  async loginSuccess(): void{
    try{
      qq.loginSuccess(()=>{
        qq.loginBrokenLineReconnection = setInterval(qq.loginSuccess.bind(qq), 60 ** 2 * 10 ** 3); // 一小时后重新登录，防止掉线
        qq.listenMessageTimer = setTimeout(qq.listenMessage.bind(qq), 500);                        // 轮询
        // 将新的qq实例存入到store中
        const ll: Array = this.props.qqLoginList;
        ll.push(qq);
        this.props.action.changeQQLoginList({
          qqLoginList: ll
        });
        this.props.history.push('/Login');
      });
    }catch(err){
      console.error('登录错误', err);
      message.error('登录失败！');
    }
  }
  // 判断是否登陆
  async isLogin(){
    // 轮询判断是否登陆
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
  }
  async componentDidMount(): void{
    // 初始化QQ
    try{
      qq = new SmartQQ('群主很懒', callback);
      const [data, cookies]: [Buffer, Object] = await qq.downloadPtqr();
      qq.cookie = cookies;
      // 写入图片
      await writeImage(option.ptqr, data);
      // 计算令牌
      qq.getToken();
      timer = setInterval(this.isLogin.bind(this), 500);
      this.setState({
        imgUrl: option.ptqr,
        loginState: 1
      });
    }catch(err){
      console.error('登录错误', err);
      message.error('初始化失败！');
    }
  }
  componentWillUnmount(): void{
    if(timer) clearInterval(timer); // 清除定时器
    if(qq) qq = null;               // 清除qq相关
  }
  ptqrBody(timeString: number): Object{
    switch(this.state.loginState){
      case 0:
        return (
          <Spin className={ style.ptqr } tip="正在加载二维码..." />
        );
      case 1:
        return (
          <img className={ style.ptqr } src={ this.state.imgUrl + '?t=' + timeString } alt="登录二维码" title="登录二维码" />
        );
      case 2:
        return (
          <Spin className={ style.ptqr } tip="登陆中...">
            <img className={ `${ style.ptqr } ${ style.o }` } src={ this.state.imgUrl + '?t=' + timeString } alt="登录二维码" title="登录二维码" />
          </Spin>
        );
    }
  }
  render(): Object{
    return (
      <div className={ style.body }>
        <div className={ style.ptqrBody }>
          { this.ptqrBody(new Date().getTime()) }
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