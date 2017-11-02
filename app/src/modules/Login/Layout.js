import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import asyncModule from '../../router/asyncModule';
import Index from 'bundle-loader?name=login!./Index/index';
import Login from 'bundle-loader?name=login!./Login/index';
import reducer from 'bundle-loader?name=login!./store/reducer';

const ModuleLayout = (props: Object): Object=>{
  return (
    <Switch>
      <Route path="/Login" component={ asyncModule(Index, reducer) } exact />
      <Route path="/Login/Login" component={ asyncModule(Login, reducer) } exact />
    </Switch>
  );
};

export default ModuleLayout;