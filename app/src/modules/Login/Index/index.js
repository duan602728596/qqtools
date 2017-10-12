// @flow
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { createSelector, createStructuredSelector } from 'reselect';
import { Affix, Table, Button, Icon } from 'antd';
import { Link } from 'react-router-dom';
import publicStyle from '../../publicMethod/public.sass';
import commonStyle from '../../../common.sass';
import { getQQLoginList } from '../store/reducer';

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
    getQQLoginList
  }, dispatch)
});

@connect(state, dispatch)
class Index extends Component{
  render(): Object{
    return [
      <Affix key={ 0 } className={ publicStyle.affix }>
        <div className={ `${ publicStyle.toolsBox } ${ commonStyle.clearfix }` }>
          <div className={ publicStyle.fl }>
            <Link to="/Login/Login">
              <Button type="primary">
                <Icon type="windows-o" />
                <span>登录</span>
              </Button>
            </Link>
          </div>
          <div className={ publicStyle.fr }>
            <Link className={ publicStyle.ml10 } to="/">
              <Button type="danger">
                <Icon type="poweroff" />
                <span>返回</span>
              </Button>
            </Link>
          </div>
        </div>
      </Affix>,
      /* 显示列表 */
      <div key={ 1 } className={ publicStyle.tableBox }>
      </div>
    ];
  }
}

export default Index;