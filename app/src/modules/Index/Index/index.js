/* 软件首页 */
import React, { Component } from 'react';
import { createSelector, createStructuredSelector } from 'reselect';
import { Link, withRouter } from 'react-router-dom';
import { Row, Col, Icon, Button, message } from 'antd';
import style from './style.sass';
import '../../../components/indexedDB/indexedDB-init';
import { handleOpenBrowser } from '../../../utils';
const gui: Object = global.require('nw.gui');

@withRouter
class Index extends Component{
  // 清除缓存
  handleClearCacheClick(event: Event): void{
    gui.App.clearCache();
    message.success('缓存清除成功！');
  }
  render(): React.Element{
    return (
      <div className={ style.body }>
        <h1 className={ style.title }>QQ群工具</h1>
        <p className={ style.text }>
          本软件遵循
          <b>GNU General Public License v3.0</b>
          许可证，非商用，如有问题请发送到邮箱duanhaochen@126.com。
        </p>
        <p className={ style.text }>
          源代码托管地址：
          <Icon type="github" theme="filled" />
          <a className={ style.url }
            onClick={ handleOpenBrowser.bind(this, 'https://github.com/duan602728596/qqtools') }
          >
            https://github.com/duan602728596/qqtools
          </a>
          。
        </p>
        <p className={ style.text }>
          酷Q下载地址：
          <Icon type="qq" theme="outlined" />
          <a className={ style.url }
            onClick={ handleOpenBrowser.bind(this, 'https://cqp.cc/') }
          >
            https://cqp.cc/
          </a>
          。
        </p>
        <p className={ style.text }>
          coolq-http-api：
          <Icon type="build" theme="filled" />
          <a className={ style.url }
            onClick={ handleOpenBrowser.bind(this, 'https://github.com/richardchien/coolq-http-api/releases') }
          >
            https://github.com/richardchien/coolq-http-api/releases
          </a>
          。
        </p>
        <div className={ style.test }>
          <Button className={ style.clearCache } onClick={ this.handleClearCacheClick.bind(this) }>清除缓存</Button>
        </div>
        <Row type="flex" align="top" justify="start">
          <Col xl={ 4 } lg={ 4 } md={ 6 } sm={ 8 } xs={ 12 }>
            <dl className={ style.linkGroup }>
              <dt className={ style.bTest }>
                <Link to="/Login" title="QQ登录">
                  <img src={ require('../image/dyx1.webp') } alt="QQ登录" />
                </Link>
              </dt>
              <dd>
                <Link to="/Login">QQ登录</Link>
              </dd>
            </dl>
          </Col>
          <Col xl={ 4 } lg={ 4 } md={ 6 } sm={ 8 } xs={ 12 }>
            <dl className={ style.linkGroup }>
              <dt className={ style.bTest }>
                <Link to="/Option" title="群功能配置">
                  <img src={ require('../image/lyn1.webp') } alt="群功能配置" />
                </Link>
              </dt>
              <dd>
                <Link to="/Option">群功能配置</Link>
              </dd>
            </dl>
          </Col>
          <Col xl={ 4 } lg={ 4 } md={ 6 } sm={ 8 } xs={ 12 }>
            <dl className={ style.linkGroup }>
              <dt className={ style.bTest }>
                <Link to="/KouDai48" title="口袋48登录和房间ID查询">
                  <img src={ require('../image/kd481.webp') } alt="口袋48登录和房间ID查询" />
                </Link>
              </dt>
              <dd>
                <Link to="/KouDai48">口袋48登录和房间ID查询</Link>
              </dd>
            </dl>
          </Col>
          <Col xl={ 4 } lg={ 4 } md={ 6 } sm={ 8 } xs={ 12 }>
            <dl className={ style.linkGroup }>
              <dt className={ style.bTest }>
                <Link to="/Help" title="帮助">
                  <img src={ require('../image/pyq1.webp') } alt="帮助" />
                </Link>
              </dt>
              <dd>
                <Link to="/Help">帮助</Link>
              </dd>
            </dl>
          </Col>
        </Row>
      </div>
    );
  }
}

export default Index;