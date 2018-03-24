import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import Index from './Index/index';
import Login from './Login/index';

const ModuleLayout: Function = (props: Object): Object=>{
  return (
    <Switch>
      <Route path="/Login" component={ Index } exact={ true } />
      <Route path="/Login/Login" component={ Login } exact={ true } />
    </Switch>
  );
};

export default ModuleLayout;
export reducer from './store/reducer';