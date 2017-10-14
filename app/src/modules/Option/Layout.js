// @flow
import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import asyncModule from '../../router/asyncModule';
import Index from 'bundle-loader?name=option!./Index/index';
import Edit from 'bundle-loader?name=option!./Edit/index';
import reducer from 'bundle-loader?name=option!./store/reducer';

const ModuleLayout = (props: Object): Object=>{
  return (
    <Switch>
      <Route path="/Option" component={ asyncModule(Index, reducer) } exact />
      <Route path="/Option/Edit" component={ asyncModule(Edit, reducer) } exact />
    </Switch>
  );
};

export default ModuleLayout;