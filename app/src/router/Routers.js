import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import asyncModule from './asyncModule';
/* 加载模块 */
import Index from '../modules/Index/Layout';

const LoginBundle = asyncModule(() => import('../modules/Login/Layout'));
const OptionBundle = asyncModule(() => import('../modules/Option/Layout'));
const KouDai48Bundle = asyncModule(() => import('../modules/KouDai48/Layout'));
const HelpBundle = asyncModule(() => import('../modules/Help/Layout'));

/* 路由模块 */
class Routers extends Component {
  render() {
    return (
      <Switch>
        {/* 首页 */}
        <Route path="/" component={ Index } exact={ true } />
        {/* 登录 */}
        <Route path="/Login" component={ LoginBundle } />
        {/* 配置 */}
        <Route path="/Option" component={ OptionBundle } />
        {/* 口袋48 */}
        <Route path="/KouDai48" component={ KouDai48Bundle } />
        {/* 帮助 */}
        <Route path="/Help" component={ HelpBundle } />
      </Switch>
    );
  }
}

export default Routers;