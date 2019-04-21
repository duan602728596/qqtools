/* 提示说明 */
import React, { Component } from 'react';
import classNames from 'classnames';
import style from '../style.sass';
import { handleOpenBrowser } from '../../../../utils';

export const IsModianLeaderboard = (props) => (
  <span className={ style.ml10 }>可以在群内查询摩点项目的相关信息、聚聚榜、打卡榜、订单。</span>
);

export const ModianUrlTemplate = (props) => (
  <div className={ style.shuoming }>
    <h6>模板关键字：</h6>
    <p>modianname：摩点项目的名称</p>
    <p>modianid：摩点项目的ID</p>
  </div>
);

export const ModianTemplate = (props) => (
  <div className={ style.shuoming }>
    <h6>模板关键字：</h6>
    <p>id：打赏人的ID</p>
    <p>money：打赏金额</p>
    <p>modianname：摩点项目的名称</p>
    <p>modianid：摩点项目的ID</p>
    <p>goal：摩点项目目标</p>
    <p>alreadyraised：当前已打赏金额</p>
    <p>amountdifference：相差金额</p>
    <p>backercount：集资参与人数</p>
    <p>endtime：项目截止时间</p>
    <p>timedifference：项目截止相差时间（格式：【x天x时x分x秒】）</p>
    <p>chouka: 当你配置了抽卡时，会输出抽卡信息</p>
  </div>
);

export const IsChoukaSendImage = (props) => (
  <span className={ style.ml10 }>该功能只限于酷QPro版本，在抽卡时发送卡牌图片。</span>
);

export const Kd48LiveListenerMembers = (props) => (
  <div className={ style.shuoming }>多个成员名字或成员ID之间用","（半角逗号）分隔。</div>
);

export const IsRoomSendImage = (props) => (
  <span className={ style.ml10 }>该功能只限于酷QPro版本。</span>
);

export const BukaQQNumber = (props) => (
  <div className={ style.shuoming }>多个QQ号之间用","（半角逗号）分隔。</div>
);

export const Kd48RoomListener = (props) => (
  <div className={ style.shuoming }>新版监听需要房间ID和成员ID。</div>
);

export const WeiBo = (props) => (
  <div className={ classNames(style.shuoming, style.url) }>
    微博lfid配置方法：
    <a onClick={ handleOpenBrowser.bind(this, 'https://github.com/duan602728596/qqtools/tree/master#微博的lfid查找方法') }>
      https://github.com/duan602728596/qqtools/tree/master#微博的lfid查找方法
    </a>
  </div>
);

export const WelcomeNewGroupMember = (props) => (
  <div className={ style.shuoming }>
    <h6>模板关键字：</h6>
    <p>nickname：新加入成员的昵称</p>
    <p>userid：新加入成员的QQ号</p>
  </div>
);

export const TimingMessagePushFormat = (props) => (
  <div className={ style.shuoming }>
    <p>
      规则格式：
      <img className={ style.nodeScheduleFormat } src={ require('./node-schedule-format.webp') } />
    </p>
    <p>如果不配置该位置，则用“*”占位；</p>
    <p>
      多个时间段用“,”分割，比如
      <var className={ style.var }>2,4,6</var>
      表示；
    </p>
    <p>
      连续时间段用类似
      <var className={ style.var }>2-6</var>
      表示；
    </p>
    <p>
      每隔多长时间，可以用类似
      <var className={ style.var }>*/5</var>
      表示；
    </p>
    <p>每个规则不要有空格，规则和规则之间要有空格。</p>
  </div>
);

export const IsHelpCommend = (props) => (
  <span className={ style.ml10 }>允许群内使用帮助命令查看功能。</span>
);