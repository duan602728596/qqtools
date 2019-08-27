import React from 'react';
import { Link } from 'react-router-dom';
import { Row, Col } from 'antd';
import style from './style.sass';

function Navs(props) {
  return (
    <Row type="flex" align="top" justify="start">
      <Col xl={ 4 } lg={ 4 } md={ 6 } sm={ 8 } xs={ 12 }>
        <dl className={ style.linkGroup }>
          <dt className={ style.bTest }>
            <Link to="/Login" title="QQ登录">
              <img src={ require('../images/dyx1.webp') } alt="QQ登录" />
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
              <img src={ require('../images/lyn1.webp') } alt="群功能配置" />
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
              <img src={ require('../images/kd481.webp') } alt="口袋48登录和房间ID查询" />
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
              <img src={ require('../images/pyq1.webp') } alt="帮助" />
            </Link>
          </dt>
          <dd>
            <Link to="/Help">帮助</Link>
          </dd>
        </dl>
      </Col>
      <Col xl={ 4 } lg={ 4 } md={ 6 } sm={ 8 } xs={ 12 }>
        <dl className={ style.linkGroup }>
          <dt className={ style.bTest }>
            <img className={ style.zfb } src={ require('../images/zfb.webp') } alt="支付宝二维码" />
          </dt>
          <dd>欢迎给我打赏</dd>
        </dl>
      </Col>
      <Col xl={ 4 } lg={ 4 } md={ 6 } sm={ 8 } xs={ 12 }>
        <dl className={ style.linkGroup }>
          <dt className={ style.bTest }>
            <img className={ style.wx } src={ require('../images/wx.webp') } alt="微信二维码" />
          </dt>
          <dd>欢迎给我打赏</dd>
        </dl>
      </Col>
    </Row>
  );
}

export default Navs;