// @flow
import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import asyncModule from '../../router/asyncModule';
import Index from 'bundle-loader?name=help!./Index/index';

const ModuleLayout = (props: Object): Object=>{
  return (
    <Switch>
      <Route path="/Help" component={ asyncModule(Index) } exact />
    </Switch>
  );
};

export default ModuleLayout;