import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import loadReducer from '../../store/loadReducer';
import reducer from './store/reducer';
import Index from './Index/index';
import Login from './Login/index';

@loadReducer(reducer)
class ModuleLayout extends Component {
  render(): React.Element {
    return (
      <Switch>
        <Route path="/Login" component={ Index } exact={ true } />
        <Route path="/Login/Login" component={ Login } exact={ true } />
      </Switch>
    );
  }
}

export default ModuleLayout;