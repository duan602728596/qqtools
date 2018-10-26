import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import loadReducer from '../../store/loadReducer';
import reducer from './store/reducer';
import Index from './Index/index';
import Edit from './Edit/index';

@loadReducer(reducer)
class ModuleLayout extends Component{
  render(): React.Element{
    return (
      <Switch>
        <Route path="/Option" component={ Index } exact={ true } />
        <Route path="/Option/Edit" component={ Edit } exact={ true } />
      </Switch>
    );
  }
}

export default ModuleLayout;