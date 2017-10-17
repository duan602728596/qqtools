// @flow
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { createSelector, createStructuredSelector } from 'reselect';
import { Affix, Table, Button, Popconfirm } from 'antd';
import publicStyle from '../../publicMethod/public.sass';
import commonStyle from '../../../common.sass';
import { changeQQLoginList } from '../store/reducer';

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

@connect(state, dispatch)
class Index extends Component{
  // 表格配置
  columus(): Array{
    const columns: Array = [
      {
        title: 'QQ昵称',
        key: 'name',
        width: '20%',
        render: (text: ?string, item: SmartQQ): string=>item.name
      },
      {
        title: '群名称',
        key: 'groupName',
        width: '15%',
        render: (text: ?string, item: SmartQQ): string=>item.option.groupName
      },
      {
        title: '配置名称',
        key: 'optionName',
        width: '20%',
        render: (text: ?string, item: SmartQQ): string=>item.option.name
      },
      {
        title: 'uin',
        key: 'uin',
        width: '15%',
        render: (text: ?string, item: SmartQQ): string=>`${ item.uin }`
      },
      {
        title: 'cip',
        key: 'cip',
        width: '15%',
        render: (text: ?string, item: SmartQQ): string=>`${ item.cip }`
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
  onLogOut(item: SmartQQ, event: Object): void{
    const index: number = this.props.qqLoginList.indexOf(item);
    clearTimeout(item.listenMessageTimer);              // 删除轮询信息
    clearInterval(item.loginBrokenLineReconnection);    // 删除断线重连
    if(item.wdsWorker){                                 // 删除微打赏的web worker
      item.sendMessage({
        type: 'cancel'
      });
      item.wdsWorker.terminate();
    }

    this.props.qqLoginList.splice(index, 1);
    this.props.action.changeQQLoginList({
      qqLoginList: this.props.qqLoginList.slice()
    });

  }
  render(): Object{
    return [
      <Affix key={ 0 } className={ publicStyle.affix }>
        <div className={ `${ publicStyle.toolsBox } ${ commonStyle.clearfix }` }>
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
               rowKey={ (item: Object): string=>item.token }
               dataSource={ this.props.qqLoginList }
               pagination={{
                 pageSize: 20,
                 showQuickJumper: true
               }} />
      </div>
    ];
  }
}

export default Index;