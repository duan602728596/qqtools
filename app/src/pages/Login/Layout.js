import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import loadReducer from '../../store/loadReducer';
import reducer from './reducer/reducer';
import Index from './Index/index';
import Login from './Login/index';
import ErrorBoundary from '../../assembly/ErrorBoundary/index';

@loadReducer(reducer)
class ModuleLayout extends Component {
  render() {
    return (
      <ErrorBoundary>
        <Switch>
          <Route path="/Login" component={ Index } exact={ true } />
          <Route path="/Login/Login" component={ Login } exact={ true } />
        </Switch>
      </ErrorBoundary>
    );
  }
}

export default ModuleLayout;