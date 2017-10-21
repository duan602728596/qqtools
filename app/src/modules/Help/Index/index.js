// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'antd';
import style from './style.sass';
import { copy } from '../../publicMethod/editOperation';

const Index = (props: Object): Array=>{
  return [
    /* 返回 */
    <Link key={ 0 } className={ style.back } to="/">
      <Button type="danger" icon="poweroff">返回</Button>
    </Link>,
    /* 正文 */
    <div key={ 1 } className={ style.body }>
      <h1 className={ style.title }>帮助</h1>
      {/* 基础命令 */}
      <h4 className={ style.seconeTitle }>命令</h4>
      <p className={ style.p }>
        [&nbsp;
        <b className={ style.b }>微打赏</b>
        &nbsp;或&nbsp;
        <b className={ style.b }>wds</b>
        &nbsp;]：查看当前微打赏链接
      </p>
      <p className={ style.p }>
        [(
        <b className={ style.b }>微打赏</b>
        &nbsp;或&nbsp;
        <b className={ style.b }>wds</b>
        )&nbsp;
        <span className={ style.c1 }>1</span>
        &nbsp;
        <span className={ style.c2 }>?number</span>
        ]：查看当前的聚聚榜
      </p>
      <p className={ style.p }>
        [(
        <b className={ style.b }>微打赏</b>
        &nbsp;或&nbsp;
        <b className={ style.b }>wds</b>
        )&nbsp;
        <span className={ style.c1 }>2</span>&nbsp;
        <span className={ style.c2 }>?number</span>
        ]：查看当前的打卡榜
      </p>
      <p className={ style.p }>
        [
        <b className={ style.b }>直播列表</b>
        &nbsp;或&nbsp;
        <b className={ style.b }>zb</b>
        ]：查看当前的口袋48直播列表
      </p>
      <p className={ style.p }>
        [(
        <b className={ style.b }>天气预报</b>
        &nbsp;或&nbsp;
        <b className={ style.b }>tq</b>
        )&nbsp;
        <span className={ style.c1 }>城市</span>
        ]：查询天气情况
      </p>
      <p className={ style.p }>
        [
        <b className={ style.b }>say</b>
        &nbsp;<span className={ style.c1 }>你想说的话</span>
        ]：机器人
      </p>
      <p className={ style.p }>
        [
        <b className={ style.b }>help</b>
        ]：帮助
      </p>
      {/* 自定义命令 */}
      <h4 className={ style.seconeTitle }>图灵机器人</h4>
      <p className={ style.p }>
        [
        <b className={ style.b }>自定义命令</b>
        ]
      </p>
      <p className={ style.p }>如果当前配置项有该命令，则会返回该命令对应的内容。</p>
      {/* 天气 */}
      <h4 className={ style.seconeTitle }>天气接口</h4>
      <p className={ style.p }>
        请自行到心知天气的官方网站&nbsp;
        <b className={ style.url } id="copy-help-xinzhitianqi" onClick={ copy.bind(this, 'copy-help-xinzhitianqi') }>
          https://www.seniverse.com/
        </b>
        &nbsp;
        <Button icon="copy" title="复制" onClick={ copy.bind(this, 'copy-help-xinzhitianqi') } />
        &nbsp;注册账号并填写appKey。
      </p>
      {/* 机器人 */}
      <h4 className={ style.seconeTitle }>图灵机器人</h4>
      <p className={ style.p }>
        请自行到图灵机器人的官方网站&nbsp;
        <b className={ style.url } id="copy-help-tuling" onClick={ copy.bind(this, 'copy-help-tuling') }>
          http://www.tuling123.com/
        </b>
        &nbsp;
        <Button icon="copy" title="复制" onClick={ copy.bind(this, 'copy-help-tuling') } />
        &nbsp;注册账号并填写appKey。
      </p>
    </div>
  ];
};

export default Index;
