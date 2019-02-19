import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import loadReducer from '../../store/loadReducer';
import reducer from './store/reducer';
import Index from './Index/index';

@loadReducer(reducer)
class ModuleLayout extends Component {
  render(): React.Node {
    return (
      <Switch>
        <Route path="/KouDai48" component={ Index } exact={ true } />
      </Switch>
    );
  }
}

export default ModuleLayout;