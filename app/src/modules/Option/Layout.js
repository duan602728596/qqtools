import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import Index from './Index/index';
import Edit from './Edit/index';

const ModuleLayout = (props: Object): Object=>{
  return (
    <Switch>
      <Route path="/Option" component={ Index } exact />
      <Route path="/Option/Edit" component={ Edit } exact />
    </Switch>
  );
};

export default ModuleLayout;
export reducer from './store/reducer';