/* 登录页 */
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import { createSelector, createStructuredSelector } from 'reselect';
import { Button, message, Select } from 'antd';
import style from './style.sass';
import publicStyle from '../../publicMethod/public.sass';
import CoolQ from '../../../components/coolQ/CoolQ';
import option from '../../publicMethod/option';
import { changeQQLoginList, cursorOption, kd48LiveListenerTimer, getLoginInformation } from '../store/reducer';
import callback from '../../../components/callback/index';
import Detail from './Detail';
import getModianInformation from '../../../components/modian/getModianInformation';
import { str2reg } from '../../../function';
import kd48timer, { init } from '../../../components/kd48listerer/timer';
import ModianWorker from 'worker-loader?name=script/modian_[hash]_worker.js!../../../components/modian/modian.worker';
import WeiBoWorker from 'worker-loader?name=script/weibo_[hash]_worker.js!../../../components/weibo/weibo.worker';
import { requestRoomMessage } from '../../../components/kd48listerer/roomListener';
const fs: Object = global.require('fs');

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
const getState: Function = ($$state: Immutable.Map): ?Immutable.Map => $$state.has('login') ? $$state.get('login') : null;

const state: Function = createStructuredSelector({
  qqLoginList: createSelector(             // QQ登录列表
    getState,
    ($$data: ?Immutable.Map): Array=>{
      const qqLoginList: Immutable.List | Array = $$data !== null ? $$data.get('qqLoginList') : [];
      return qqLoginList instanceof Array ? qqLoginList : qqLoginList.toJS();
    }
  ),
  optionList: createSelector(              // QQ配置列表
    getState,
    ($$data: ?Immutable.Map): Array=>{
      const optionList: Immutable.List | Array = $$data !== null ? $$data.get('optionList') : [];
      return optionList instanceof Array ? optionList : optionList.toJS();
    }
  ),
  kd48LiveListenerTimer: createSelector(   // 口袋直播
    getState,
    ($$data: ?Immutable.Map): ?number => $$data !== null ? $$data.get('kd48LiveListenerTimer') : null
  )
});

/* dispatch */
const dispatch: Function = (dispatch: Function): Object=>({
  action: bindActionCreators({
    changeQQLoginList,
    cursorOption,
    kd48LiveListenerTimer,
    getLoginInformation
  }, dispatch)
});

@withRouter
@connect(state, dispatch)
class Login extends Component{
  state: {
    optionItemIndex: ?number
  };
  constructor(): void{
    super(...arguments);

    this.state = {
      optionItemIndex: null // 当前选择的配置索引
    };
  }
  componentWillMount(): void{
    this.props.action.cursorOption({
      query: {
        indexName: 'time'
      }
    });
  }
  // select
  selectOption(): Array{
    return this.props.optionList.map((item: Object, index: number): void=>{
      const index1: string = `${ index }`;
      return (
        <Select.Option key={ index1 } value={ index1 }>
          { item.name }
        </Select.Option>
      );
    });
  }
  onOptionSelect(value: number, option: any): void{
    this.setState({
      optionItemIndex: value
    });
  }
  // 登录连接
  onLogin(event: Event): void{
    const option: Object = this.props.optionList[Number(this.state.optionItemIndex)];
    const qq: CoolQ = new CoolQ(option.qqNumber, option.socketPort, callback);
    qq.option = option;
    qq.init();
    // 登录成功
    const cb: Function = async(): void=>{
      if(qq.isEventSuccess === true && qq.isApiSuccess === true){
        const basic: Object = qq.option.basic;
        // 获取微打赏相关信息
        if(basic.isModian){
          const { title, goal }: {
            title: string,
            goal: string
          } = await getModianInformation(basic.modianId);
          qq.modianTitle = title;
          qq.modianGoal = goal;
          // 创建新的摩点webWorker
          qq.modianWorker = new ModianWorker();
          qq.modianWorker.postMessage({
            type: 'init',
            modianId: basic.modianId,
            title,
            goal
          });
          qq.modianWorker.addEventListener('message', qq.listenModianWorkerCbInformation.bind(qq), false);
        }
        // 口袋48直播监听
        if(basic.is48LiveListener){
          const memberReg: RegExp = str2reg(basic.kd48LiveListenerMembers);
          qq.members = memberReg;
          // 开启口袋48监听
          await init();
          if(this.props.kd48LiveListenerTimer === null){
            this.props.action.kd48LiveListenerTimer({
              timer: global.setInterval(kd48timer, 15000)
            });
          }
        }
        // 房间信息监听
        if(basic.isRoomListener){
          // 数据库读取token
          const res: Object = await this.props.action.getLoginInformation({
            query: 'loginInformation'
          });
          if(res.result !== undefined){
            qq.kouDai48Token = res.result.value.token;
            const req: Object = await requestRoomMessage(basic.roomId, qq.kouDai48Token);
            qq.roomLastTime = req.content.data[0].msgTime;
            qq.roomListenerTimer = global.setTimeout(qq.listenRoomMessage.bind(qq), 15000);
          }
        }
        // 微博监听
        if(basic.isWeiboListener){
          qq.weiboWorker = new WeiBoWorker();
          qq.weiboWorker.postMessage({
            type: 'init',
            containerid: basic.lfid
          });
          qq.weiboWorker.addEventListener('message', qq.listenWeiboWorkerCbInformation.bind(qq), false);
        }
        // 群内定时消息推送
        if(basic.isTimingMessagePush){
          qq.timingMessagePushTimer = global.setInterval(qq.timeIsOption.bind(qq), 10 * (10 ** 3));
        }
        const ll: Array = this.props.qqLoginList;
        ll.push(qq);
        this.props.action.changeQQLoginList({
          qqLoginList: ll
        });
        this.props.history.push('/Login');
      }else{
        setTimeout(cb, 100);
      }
    };
    cb();
  }
  render(): Object{
    const index: ?number = this.state.optionItemIndex ? Number(this.state.optionItemIndex) : null;
    return (
      <div className={ style.body }>
        <div className={ style.changeOption }>
          <p className={ style.zhuyi }>注意：要先登录酷Q！</p>
          <label>选择一个配置文件：</label>
          <Select className={ style.select }
            dropdownClassName={ style.select }
            value={ this.state.optionItemIndex }
            onSelect={ this.onOptionSelect.bind(this) }
          >
            { this.selectOption() }
          </Select>
          <Link className={ publicStyle.ml10 } to="/Login">
            <Button type="danger">返回</Button>
          </Link>
          <Button className={ publicStyle.ml10 }
            type="primary"
            disabled={ !this.state.optionItemIndex }
            onClick={ this.onLogin.bind(this) }
          >
            连接
          </Button>
        </div>
        <Detail detail={ index === null ? null : this.props.optionList[index] } />
      </div>
    );
  }
}

export default Login;