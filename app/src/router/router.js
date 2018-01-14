import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import asyncModule from './asyncModule';
/* 加载模块 */
import Index from '../modules/Index/Layout';
import Login from 'bundle-loader?name=login!../modules/Login/Layout';
import Option from 'bundle-loader?name=option!../modules/Option/Layout';
import Help from 'bundle-loader?name=help!../modules/Help/Layout';

const LoginBundle: Function = asyncModule(Login);
const OptionBundle: Function = asyncModule(Option);
const HelpBundle: Function = asyncModule(Help);

/* 路由模块 */
class Router extends Component{
  render(): Object{
    return (
      <Switch>
        {/* 首页 */}
        <Route path="/" component={ Index } exact />
        {/* 登录 */}
        <Route path="/Login" component={ LoginBundle } />
        {/* 配置 */}
        <Route path="/Option" component={ OptionBundle } />
        {/* 帮助 */}
        <Route path="/Help" component={ HelpBundle } />
      </Switch>
    );
  }
}

export default Router;