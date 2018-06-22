import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import asyncModule from './asyncModule';
/* 加载模块 */
import Index from '../modules/Index/Layout';
import Login from 'bundle-loader?lazy&name=login!../modules/Login/Layout';
import Option from 'bundle-loader?lazy&name=option!../modules/Option/Layout';
import KouDai48 from 'bundle-loader?lazy&name=koudai48!../modules/KouDai48/Layout';
import Help from 'bundle-loader?lazy&name=help!../modules/Help/Layout';

const LoginBundle: Function = asyncModule(Login);
const OptionBundle: Function = asyncModule(Option);
const KouDai48Bundle: Function = asyncModule(KouDai48);
const HelpBundle: Function = asyncModule(Help);

/* 路由模块 */
class Routers extends Component{
  render(): Object{
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
