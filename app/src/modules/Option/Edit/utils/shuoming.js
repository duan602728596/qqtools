/* 提示说明 */
import React, { Component } from 'react';
import classNames from 'classnames';
import style from '../style.sass';
import { handleOpenBrowser } from '../../../../utils';

export const IsModianLeaderboard: Function = (props: Object): React.Element => (
  <span className={ style.ml10 }>可以在群内查询摩点项目的相关信息、聚聚榜、打卡榜、订单。</span>
);

export const ModianUrlTemplate: Function = (props: Object): React.Element => (
  <div className={ style.shuoming }>
    <h6>模板关键字：</h6>
    <p>modianname：摩点项目的名称</p>
    <p>modianid：摩点项目的ID</p>
  </div>
);

export const ModianTemplate: Function = (props: Object): React.Element => (
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
  </div>
);

export const Kd48LiveListenerMembers: Function = (props: Object): React.Element => (
  <div className={ style.shuoming }>多个成员名字或成员ID之间用","（半角逗号）分隔。</div>
);

export const IsRoomSendImage: Function = (props: Object): React.Element => (
  <span className={ style.ml10 }>该功能只限于酷QPro版本。</span>
);

export const WeiBo: Function = (props: Object): React.Element => (
  <div className={ classNames(style.shuoming, style.url) }>
    微博lfid配置方法：
    <a onClick={ handleOpenBrowser.bind(this, 'https://github.com/duan602728596/qqtools/tree/master#微博的lfid查找方法') }>
      https://github.com/duan602728596/qqtools/tree/master#微博的lfid查找方法
    </a>
  </div>
);

export const WelcomeNewGroupMember: Function = (props: Object): React.Element => (
  <div className={ style.shuoming }>
    <h6>模板关键字：</h6>
    <p>nickname：群成员的昵称</p>
  </div>
);

export const TimingMessagePushFormat: Function = (props: Object): React.Element => (
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

export const IsHelpCommend: Function = (props: Object): React.Element => (
  <span className={ style.ml10 }>允许群内使用帮助命令查看功能。</span>
);