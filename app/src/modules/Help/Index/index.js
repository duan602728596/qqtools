import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'antd';
import style from './style.sass';

const Index: Function = (props: Object): React.ChildrenArray<React.Element>=>{
  return [
    /* 返回 */
    <Link key="0" className={ style.back } to="/">
      <Button type="danger" icon="poweroff">返回</Button>
    </Link>,
    /* 正文 */
    <h1 key="1" className={ style.title }>帮助</h1>,
    /* 基础命令 */
    <h4 key="2" className={ style.seconeTitle }>命令</h4>,
    <div key="3" className={ style.body }>
      <p className={ style.p }>
        [
        <b className={ style.b }>摩点</b>
        &nbsp;或&nbsp;
        <b className={ style.b }>集资</b>
        &nbsp;或&nbsp;
        <b className={ style.b }>mod</b>
        ]：查看当前摩点项目链接
      </p>
      <p className={ style.p }>
        [(
        <b className={ style.b }>摩点</b>
        &nbsp;或&nbsp;
        <b className={ style.b }>集资</b>
        &nbsp;或&nbsp;
        <b className={ style.b }>mod</b>
        )
        <span className={ style.space }>空格</span>
        (
        <span className={ style.c1 }>0</span>
        &nbsp;或&nbsp;
        <span className={ style.c1 }>项目信息</span>
        )]：查看当前的集资总金额
      </p>
      <p className={ style.p }>
        [(
        <b className={ style.b }>摩点</b>
        &nbsp;或&nbsp;
        <b className={ style.b }>集资</b>
        &nbsp;或&nbsp;
        <b className={ style.b }>mod</b>
        )
        <span className={ style.space }>空格</span>
        (
        <span className={ style.c1 }>1</span>
        &nbsp;或&nbsp;
        <span className={ style.c1 }>聚聚榜</span>
        )
        <span className={ style.space }>空格</span>
        <span className={ style.c2 }>?number</span>
        ]：查看聚聚榜
      </p>
      <p className={ style.p }>
        [(
        <b className={ style.b }>摩点</b>
        &nbsp;或&nbsp;
        <b className={ style.b }>集资</b>
        &nbsp;或&nbsp;
        <b className={ style.b }>mod</b>
        )
        <span className={ style.space }>空格</span>
        (
        <span className={ style.c1 }>2</span>
        &nbsp;或&nbsp;
        <span className={ style.c1 }>打卡榜</span>
        )
        <span className={ style.space }>空格</span>
        <span className={ style.c2 }>?number</span>
        ]：查看打卡榜
      </p>
      <p className={ style.p }>
        [(
        <b className={ style.b }>摩点</b>
        &nbsp;或&nbsp;
        <b className={ style.b }>集资</b>
        &nbsp;或&nbsp;
        <b className={ style.b }>mod</b>
        )
        <span className={ style.space }>空格</span>
        (
        <span className={ style.c1 }>3</span>
        &nbsp;或&nbsp;
        <span className={ style.c1 }>订单</span>
        )
        <span className={ style.space }>空格</span>
        <span className={ style.c2 }>?number</span>
        ]：订单查询
      </p>
      <p className={ style.p }>
        [
        <b className={ style.b }>补卡</b>
        <span className={ style.space }>空格</span>
        <b className={ style.c1 }>摩点ID</b>
        <span className={ style.space }>空格</span>
        <b className={ style.c2 }>number</b>
        ]：补卡
      </p>
      <p className={ style.p }>
        [
        <b className={ style.b }>查卡</b>
        <span className={ style.space }>空格</span>
        (
        <b className={ style.c1 }>摩点ID</b>
        &nbsp;或&nbsp;
        <b className={ style.c1 }>摩点昵称</b>
        )
        ]：查卡
      </p>
      <p className={ style.p }>
        [
        <b className={ style.b }>直播列表</b>
        &nbsp;或&nbsp;
        <b className={ style.b }>zb</b>
        ]：查看当前的口袋48直播列表
      </p>
      <p className={ style.p }>
        [
        <b className={ style.b }>help</b>
        ]：帮助
      </p>
    </div>,
    /* 自定义命令 */
    <h4 key="4" className={ style.seconeTitle }>自定义命令</h4>,
    <div key="5" className={ style.body }>
      <p className={ style.p }>
        [
        <b className={ style.b }>自定义命令</b>
        ]
      </p>
      <p className={ style.p }>如果当前配置项有该命令，则会返回该命令对应的内容。</p>
    </div>
  ];
};

export default Index;