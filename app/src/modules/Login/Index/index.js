// @flow
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { createSelector, createStructuredSelector } from 'reselect';
import { Affix, Table, Button, Radio, Input } from 'antd';
import style from './style.sass';
import publicStyle from '../../publicMethod/public.sass';
import commonStyle from '../../../common.sass';
import { changeQQLoginList } from '../store/reducer';
import SmartQQ from "../../../components/smartQQ/SmartQQ";
import { copy } from '../../publicMethod/editOperation';

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
  state: {
    proxyMode: string,
    proxyIp: string,
    proxyPort: string
  };
  constructor(props: Object): void{
    super(props);

    this.state = {
      proxyMode: '不使用代理',
      proxyIp: '',
      proxyPort: ''
    };
  }
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
        width: '20%',
        render: (text: ?string, item: SmartQQ): string=>item.option.groupName
      },
      {
        title: 'uin',
        key: 'uin',
        width: '20%',
        render: (text: ?string, item: SmartQQ): string=>`${ item.uin }`
      },
      {
        title: 'cip',
        key: 'cip',
        width: '20%',
        render: (text: ?string, item: SmartQQ): string=>`${ item.cip }`
      },
      {
        title: '操作',
        key: 'handle',
        width: '20%'
      }
    ];
    return columns;
  }
  // 选择代理
  onChangeProxy(key: string, event: Object): void{
    this.setState({
      [key]: event.target.value
    });
  }
  render(): Object{
    return [
      <Affix key={ 0 } className={ publicStyle.affix }>
        <div className={ `${ publicStyle.toolsBox } ${ commonStyle.clearfix }` }>
          <div className={ publicStyle.fl }>
            <Link className={ publicStyle.mr10 } to={{
              pathname: '/Login/Login',
              query: {
                proxyMode: this.state.proxyMode,
                proxyIp: this.state.proxyIp,
                proxyPort: this.state.proxyPort
              }
            }}>
              <Button type="primary" icon="windows-o">登录</Button>
            </Link>
          </div>
          {/* 配置代理服务器 */}
          <div className={ publicStyle.fl }>
            <b>使用代理登录QQ：</b>
            <Radio.Group options={['不使用代理', 'http', 'https']} value={ this.state.proxyMode } onChange={ this.onChangeProxy.bind(this, 'proxyMode') } />
            <label htmlFor="proxyIp">IP地址：</label>
            <Input className={ `${ publicStyle.mr10 } ${ style.proxyIp }` }
                   id="proxyIp"
                   disabled={ this.state.proxyMode === '不使用代理' }
                   value={ this.state.proxyIp }
                   onChange={ this.onChangeProxy.bind(this, 'proxyIp') } />
            <label htmlFor="proxyPort">端口号：</label>
            <Input className={ `${ style.proxyPort } ${ publicStyle.mr10 }` }
                   id="proxyPort"
                   disabled={ this.state.proxyMode === '不使用代理' }
                   value={ this.state.proxyPort }
                   onChange={ this.onChangeProxy.bind(this, 'proxyPort') } />
            <span>
              如果有请求失败的情况，请去&nbsp;
              <b className={ style.url } id="copy-login-proxy" onClick={ copy.bind(this, 'copy-login-proxy') }>http://www.xicidaili.com/</b>
              &nbsp;
              <Button icon="copy" title="复制" onClick={ copy.bind(this, 'copy-login-proxy') } />
              &nbsp;使用代理来登录。
            </span>
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