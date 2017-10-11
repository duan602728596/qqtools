// @flow
import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import asyncModule from './asyncModule';
/* 加载模块 */
import Index from '../modules/Index/Layout';
import Login from '../modules/Login/Layout';

/* 路由模块 */
class Router extends Component{
  render(): Object{
    return (
      <Switch>
        {/* 首页 */}
        <Route path="/" component={ Index } exact />
        {/* 登录 */}
        <Route path="/Login" component={ Login } />
      </Switch>
    );
  }
}

export default Router;