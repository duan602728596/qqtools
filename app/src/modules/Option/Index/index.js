// @flow
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { createSelector, createStructuredSelector } from 'reselect';
import { Affix, Table, Button, Icon } from 'antd';
import publicStyle from '../../publicMethod/public.sass';
import commonStyle from '../../../common.sass';
import { optionList, cursorOptionList } from '../store/reducer';

/* 初始化数据 */
const state: Function = createStructuredSelector({
  optionList: createSelector(         // 已登录
    (state: Object): Object | Array=>state.has('option') ? state.get('option').get('optionList') : [],
    (data: Object | Array): Array=>data instanceof Array ? data : data.toJS()
  )
});

/* dispatch */
const dispatch: Function = (dispatch: Function): Object=>({
  action: bindActionCreators({
    optionList,
    cursorOptionList
  }, dispatch)
});

@connect(state, dispatch)
class Index extends Component{
  render(): Array{
    return [
      <Affix key={ 0 } className={ publicStyle.affix }>
        <div className={ `${ publicStyle.toolsBox } ${ commonStyle.clearfix }` }>
          <div className={ publicStyle.fl }>
            <Link to="/">
              <Button type="primary">
                <Icon type="plus-circle-o" />
                <span>添加新配置</span>
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
      <div key={ 1 } className={ publicStyle.tableBox }>1234</div>
    ];
  }
}

export default Index;