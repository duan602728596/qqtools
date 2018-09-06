import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { createSelector, createStructuredSelector } from 'reselect';
import { Affix, Table, Button, Popconfirm } from 'antd';
import classNames from 'classnames';
import publicStyle from '../../../components/publicStyle/public.sass';
import { changeQQLoginList, kd48LiveListenerTimer } from '../store/reducer';

/* 初始化数据 */
const getState: Function = ($$state: Immutable.Map): ?Immutable.Map => $$state.has('login') ? $$state.get('login') : null;

const state: Function = createStructuredSelector({
  qqLoginList: createSelector(             // 已登录
    getState,
    ($$data: ?Immutable.Map): Array => $$data !== null ? $$data.get('qqLoginList').toJS() : []
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
  static propTypes: Object = {
    qqLoginList: PropTypes.array,
    kd48LiveListenerTimer: PropTypes.number,
    action: PropTypes.objectOf(PropTypes.func)
  };

  // 表格配置
  columus(): Array{
    const columns: Array = [
      {
        title: '配置名称',
        key: 'optionName',
        width: '25%',
        render: (value: any, item: CoolQ): string => item.option.name
      },
      {
        title: 'QQ号',
        key: 'qqNumber',
        width: '25%',
        render: (value: any, item: CoolQ): string => item.qq
      },
      {
        title: '监听群号',
        key: 'groupNumber',
        width: '25%',
        render: (value: any, item: CoolQ): string => item.option.groupNumber
      },
      {
        title: '操作',
        key: 'handle',
        width: '25%',
        render: (value: any, item: CoolQ): React.Element=>{
          return (
            <Popconfirm title="确认要退出吗？" onConfirm={ this.handleLogOutClick.bind(this, item) }>
              <Button type="danger" size="small" icon="logout">退出</Button>
            </Popconfirm>
          );
        }
      }
    ];
    return columns;
  }
  // 退出
  handleLogOutClick(item: CoolQ, event: Event): void{
    const index: number = this.props.qqLoginList.indexOf(item);
    item.outAndClear();

    this.props.qqLoginList.splice(index, 1);
    this.props.action.changeQQLoginList({
      qqLoginList: this.props.qqLoginList.slice()
    });

    // 判断是否需要关闭直播监听
    if(this.props.kd48LiveListenerTimer !== null){
      let isListener: boolean = false;
      for(let i: number = 0, j: number = this.props.qqLoginList.length; i < j; i++){
        const item: CoolQ = this.props.qqLoginList[i];
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
  }
  render(): React.ChildrenArray<React.Element>{
    return [
      <Affix key="affix" className={ publicStyle.affix }>
        <div className={ classNames(publicStyle.toolsBox, 'clearfix') }>
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
      <div key="tableBox" className={ publicStyle.tableBox }>
        <Table bordered={ true }
          columns={ this.columus() }
          rowKey={ (item: Object): string => item.time }
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