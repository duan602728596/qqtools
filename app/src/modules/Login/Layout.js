// @flow
import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import asyncModule from '../../router/asyncModule';
import Index from 'bundle-loader?name=login!./Index/index';

const ModuleLayout = (props: Object): Object=>{
  return (
    <Switch>
      <Route path="/Login" component={ asyncModule(Index) } exact />
    </Switch>
  );
};

export default ModuleLayout;