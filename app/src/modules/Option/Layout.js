import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import Index from './Index/index';
import Edit from './Edit/index';

const ModuleLayout: Function = (props: Object): Object=>{
  return (
    <Switch>
      <Route path="/Option" component={ Index } exact={ true } />
      <Route path="/Option/Edit" component={ Edit } exact={ true } />
    </Switch>
  );
};

export default ModuleLayout;
export reducer from './store/reducer';