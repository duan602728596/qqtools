import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { Row, Col } from 'antd';
import style from './style.sass';

@withRouter
class Navs extends Component{
  render(): React.Element{
    return (
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
    );
  }
}

export default Navs;