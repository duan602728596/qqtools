/* 登录页 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import { createSelector, createStructuredSelector } from 'reselect';
import { Button, Select, message } from 'antd';
import moment from 'moment';
import style from './style.sass';
import publicStyle from '../../../components/publicStyle/public.sass';
import CoolQ from '../../../components/coolQ/CoolQ';
import { changeQQLoginList, cursorOption, kd48LiveListenerTimer, getLoginInformation } from '../store/reducer';
import callback from '../../../components/callback/callback';
import Detail from './Detail';
import getModianInformation from '../../../components/modian/getModianInformation';
import { str2reg, str2numberArray, cleanRequireCache } from '../../../utils';
import kd48timer, { init } from '../../../components/kd48listerer/timer';
import ModianWorker from 'worker-loader?name=script/[hash:5].worker.js!../../../components/modian/modian.worker';
import WeiBoWorker from 'worker-loader?name=script/[hash:5].worker.js!../../../components/weibo/weibo.worker';
import { requestRoomMessage } from '../../../components/kd48listerer/roomListener';
const schedule: Object = global.require('node-schedule');

/* 初始化数据 */
const getState: Function = ($$state: Immutable.Map): ?Immutable.Map => $$state.has('login') ? $$state.get('login') : null;

const state: Function = createStructuredSelector({
  qqLoginList: createSelector( // QQ登录列表
    getState,
    ($$data: ?Immutable.Map): Array => $$data !== null ? $$data.get('qqLoginList').toJS() : []
  ),
  optionList: createSelector( // QQ配置列表
    getState,
    ($$data: ?Immutable.Map): Array => $$data !== null ? $$data.get('optionList').toJS() : []
  ),
  kd48LiveListenerTimer: createSelector( // 口袋直播
    getState,
    ($$data: ?Immutable.Map): ?number => $$data !== null ? $$data.get('kd48LiveListenerTimer') : null
  )
});

/* dispatch */
const dispatch: Function = (dispatch: Function): Object => ({
  action: bindActionCreators({
    changeQQLoginList,
    cursorOption,
    kd48LiveListenerTimer,
    getLoginInformation
  }, dispatch)
});

@withRouter
@connect(state, dispatch)
class Login extends Component {
  qq: ?CoolQ;
  timer: ?number;
  state: {
    btnLoading: boolean;
    optionItemIndex: ?number;
  };

  static propTypes: Object = {
    qqLoginList: PropTypes.array,
    optionList: PropTypes.array,
    kd48LiveListenerTimer: PropTypes.number,
    action: PropTypes.objectOf(PropTypes.func),
    history: PropTypes.object,
    location: PropTypes.object,
    match: PropTypes.object
  };

  constructor(): void {
    super(...arguments);

    this.qq = null;
    this.timer = null;
    this.state = {
      btnLoading: false, // 按钮loading动画
      optionItemIndex: null // 当前选择的配置索引
    };
  }
  componentDidMount(): void {
    this.props.action.cursorOption({
      query: {
        indexName: 'time'
      }
    });
  }
  // select
  selectOptionView(): Array<React.Node> {
    return this.props.optionList.map((item: Object, index: number): React.Node => {
      const index1: string = `${ index }`;

      return (
        <Select.Option key={ index1 } value={ index1 }>
          { item.name }
        </Select.Option>
      );
    });
  }
  handleOptionSelect(value: number, option: any): void {
    this.setState({
      optionItemIndex: value
    });
  }
  // 登录成功
  async loginSuccess(): Promise<void> {
    try {
      const basic: Object = this.qq.option.basic;

      this.qq.time = moment().unix();

      // 获取酷Q的相关信息
      this.qq.getCoolQVersionInfo();

      // 获取摩点相关信息
      if (basic.isModian) {
        const { title, goal }: {
          title: string;
          goal: string;
        } = await getModianInformation(basic.modianId);

        this.qq.modianTitle = title;
        this.qq.modianGoal = goal;
        // 创建新的摩点webWorker
        this.qq.modianWorker = new ModianWorker();
        this.qq.modianWorker.postMessage({
          type: 'init',
          modianId: basic.modianId,
          title,
          goal
        });
        this.qq.modianWorker.addEventListener(
          'message',
          this.qq.listenModianWorkerCbInformation.bind(this.qq),
          false
        );
        message.success('摩点监听已就绪。');
      }

      // 抽卡
      if (basic.isChouka) {
        cleanRequireCache(basic.choukaJson);
        this.qq.choukaJson = global.require(basic.choukaJson);
        this.qq.bukaQQNumber = str2numberArray(basic.bukaQQNumber);
        message.success('抽卡已就绪。');
      }

      // 口袋48直播监听
      if (basic.is48LiveListener) {
        this.qq.members = str2reg(basic.kd48LiveListenerMembers); // 正则匹配
        this.qq.memberId = str2numberArray(basic.kd48LiveListenerMembers); // 获取id
        // 开启口袋48监听
        await init();
        if (this.props.kd48LiveListenerTimer === null) {
          this.props.action.kd48LiveListenerTimer({
            timer: global.setInterval(kd48timer, 15000)
          });
        }
        message.success('口袋48直播监听已就绪。');
      }

      // 房间信息监听
      if (basic.isRoomListener) {
        // 数据库读取token
        const res: Object = await this.props.action.getLoginInformation({
          query: 'loginInformation'
        });

        if (res.result !== undefined) {
          this.qq.kouDai48Token = res.result.value.token;
          const req: Object = await requestRoomMessage(basic.roomId, this.qq.kouDai48Token);

          this.qq.roomLastTime = req.content.data[0].msgTime;
          this.qq.roomListenerTimer = global.setTimeout(
            this.qq.listenRoomMessage.bind(this.qq),
            basic.liveListeningInterval ? (basic.liveListeningInterval * 1000) : 15000
          );
        }
        message.success('口袋48房间监听已就绪。');
      }

      // 微博监听
      if (basic.isWeiboListener) {
        this.qq.weiboWorker = new WeiBoWorker();
        this.qq.weiboWorker.postMessage({
          type: 'init',
          containerid: basic.lfid
        });
        this.qq.weiboWorker.addEventListener(
          'message',
          this.qq.listenWeiboWorkerCbInformation.bind(this.qq),
          false
        );
        message.success('微博监听已就绪。');
      }

      // 群内定时消息推送
      if (basic.isTimingMessagePush) {
        this.qq.timingMessagePushTimer = schedule.scheduleJob(
          basic.timingMessagePushFormat,
          this.qq.timingMessagePush.bind(this.qq, basic.timingMessagePushText)
        );
        message.success('群内定时消息推送已就绪。');
      }

      const ll: Array = this.props.qqLoginList;

      ll.push(this.qq);
      this.props.action.changeQQLoginList({
        qqLoginList: ll
      });
      this.qq = null;
      this.props.history.push('/Login');
    } catch (err) {
      console.error(err);
    }
  }
  // 登录轮询
  loginCb(): void {
    if (this.qq.isEventSuccess === true && this.qq.isApiSuccess === true) { // 判断登录成功
      this.loginSuccess();
    } else if (this.qq.isError === true) { // 判断是否有错误
      this.qq = null;
      this.setState({
        btnLoading: false
      });
    } else {
      this.timer = setTimeout(this.loginCb.bind(this), 100);
    }
  }
  // 登录连接
  handleLoginClick(event: Event): void {
    this.setState({
      btnLoading: true
    });
    const option: Object = this.props.optionList[Number(this.state.optionItemIndex)];

    this.qq = new CoolQ(option.qqNumber, option.socketPort, callback);
    this.qq.option = option;
    this.qq.init();
    // 登录成功
    this.loginCb();
  }
  componentWillUnmount(): void {
    if (this.timer) global.clearInterval(this.timer); // 清除定时器
    // 清除qq相关
    if (this.qq !== null) {
      this.qq.outAndClear();
      // 判断是否需要关闭直播监听
      if (this.props.kd48LiveListenerTimer !== null) {
        let isListener: boolean = false;

        for (let i: number = 0, j: number = this.props.qqLoginList.length; i < j; i++) {
          const item: CoolQ = this.props.qqLoginList[i];

          if (item.option.basic.is48LiveListener && item.members) {
            isListener = true;
            break;
          }
        }
        if (isListener === false) {
          global.clearInterval(this.props.kd48LiveListenerTimer);
          this.props.action.kd48LiveListenerTimer({
            timer: null
          });
        }
      }

      this.qq = null;
    }
  }
  render(): React.Node {
    const index: ?number = this.state.optionItemIndex ? Number(this.state.optionItemIndex) : null;

    return (
      <div className={ style.body }>
        <div className={ style.changeOption }>
          <p className={ style.zhuyi }>注意：要先登录酷Q！</p>
          <label>选择一个配置文件：</label>
          <Select className={ style.select }
            dropdownClassName={ style.select }
            value={ this.state.optionItemIndex }
            onSelect={ this.handleOptionSelect.bind(this) }
          >
            { this.selectOptionView() }
          </Select>
          <Link className={ publicStyle.ml10 } to="/Login">
            <Button type="danger">返回</Button>
          </Link>
          <Button className={ publicStyle.ml10 }
            type="primary"
            loading={ this.state.btnLoading }
            disabled={ !this.state.optionItemIndex }
            onClick={ this.handleLoginClick.bind(this) }
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