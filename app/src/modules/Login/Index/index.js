import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { createSelector, createStructuredSelector } from 'reselect';
import { Affix, Table, Button, Popconfirm } from 'antd';
import publicStyle from '../../publicMethod/public.sass';
import { changeQQLoginList, kd48LiveListenerTimer } from '../store/reducer';

/* 初始化数据 */
const getState: Function = ($$state: Immutable.Map): ?Immutable.Map => $$state.has('login') ? $$state.get('login') : null;

const state: Function = createStructuredSelector({
  qqLoginList: createSelector(             // 已登录
    getState,
    ($$data: ?Immutable.Map): Array=>{
      const qqLoginList: Immutable.List | Array = $$data !== null ? $$data.get('qqLoginList') : [];
      return qqLoginList instanceof Array ? qqLoginList : qqLoginList.toJS();
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
    kd48LiveListenerTimer
  }, dispatch)
});

@connect(state, dispatch)
class Index extends Component{
  // 表格配置
  columus(): Array{
    const columns: Array = [
      {
        title: 'QQ昵称',
        key: 'name',
        width: '20%',
        render: (text: ?string, item: SmartQQ): string => item.name
      },
      {
        title: '群名称',
        key: 'groupName',
        width: '15%',
        render: (text: ?string, item: SmartQQ): string => item.option.groupName
      },
      {
        title: '配置名称',
        key: 'optionName',
        width: '20%',
        render: (text: ?string, item: SmartQQ): string => item.option.name
      },
      {
        title: 'uin',
        key: 'uin',
        width: '15%',
        render: (text: ?string, item: SmartQQ): string => `${ item.uin }`
      },
      {
        title: 'cip',
        key: 'cip',
        width: '15%',
        render: (text: ?string, item: SmartQQ): string => `${ item.cip }`
      },
      {
        title: '操作',
        key: 'handle',
        width: '15%',
        render: (text: ?string, item: SmartQQ): Object=>{
          return (
            <Popconfirm title="确认要退出吗？" onConfirm={ this.onLogOut.bind(this, item) }>
              <Button type="danger" size="small" icon="logout">退出</Button>
            </Popconfirm>
          );
        }
      }
    ];
    return columns;
  }
  // 退出
  onLogOut(item: SmartQQ, event: Event): void{
    const index: number = this.props.qqLoginList.indexOf(item);
    global.clearTimeout(item.listenMessageTimer);              // 删除轮询信息
    global.clearInterval(item.loginBrokenLineReconnection);    // 删除断线重连

    // 删除摩点的web worker
    if(item.modianWorker){
      item.sendMessage({
        type: 'cancel'
      });
      item.modianWorker.terminate();
      item.modianWorker = null;
    }

    this.props.qqLoginList.splice(index, 1);
    this.props.action.changeQQLoginList({
      qqLoginList: this.props.qqLoginList.slice()
    });

    // 判断是否需要关闭直播监听
    if(this.props.kd48LiveListenerTimer !== null){
      let isListener: boolean = false;
      for(let i = 0, j = this.props.qqLoginList.length; i < j; i++){
        const item: SmartQQ = this.props.qqLoginList[i];
        if(item.option.basic.is48LiveListener && item.members){
          isListener = true;
          break;
        }
      }
      if(isListener === false){
        global.clearInterval(this.props.kd48LiveListenerTimer);
        this.props.action.kd48LiveListenerTimer({
          timer: null
        });
      }
    }

    // 关闭房间信息监听
    if(item.roomListenerTimer !== null) global.clearTimeout(item.roomListenerTimer);
  }
  render(): Array{
    return [
      <Affix key={ 0 } className={ publicStyle.affix }>
        <div className={ `${ publicStyle.toolsBox } clearfix` }>
          <div className={ publicStyle.fl }>
            <Link className={ publicStyle.mr10 } to="/Login/Login">
              <Button type="primary" icon="windows-o">登录</Button>
            </Link>
          </div>
          <div className={ publicStyle.fr }>
            <Link className={ publicStyle.ml10 } to="/">
              <Button type="danger" icon="poweroff">返回</Button>
            </Link>
          </div>
        </div>
      </Affix>,
      /* 显示列表 */
      <div key={ 1 } className={ publicStyle.tableBox }>
        <Table bordered={ true }
          columns={ this.columus() }
          rowKey={ (item: Object): string => item.token }
          dataSource={ this.props.qqLoginList }
          pagination={{
            pageSize: 20,
            showQuickJumper: true
          }}
        />
      </div>
    ];
  }
}

export default Index;