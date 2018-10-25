import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Route, Switch } from 'react-router-dom';
import Index from './Index/index';

class ModuleLayout extends Component{
  static propTypes: Object = {
    injectReducers: PropTypes.func
  };

  render(): React.Element{
    return (
      <Switch>
        <Route path="/Help" component={ Index } exact={ true } />
      </Switch>
    );
  }
}

export default ModuleLayout;