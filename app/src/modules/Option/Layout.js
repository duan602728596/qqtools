import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Route, Switch } from 'react-router-dom';
import reducer from './store/reducer';
import Index from './Index/index';
import Edit from './Edit/index';

class ModuleLayout extends Component{
  static propTypes: Object = {
    injectReducers: PropTypes.func
  };

  constructor(): void{
    super(...arguments);

    this.props.injectReducers(reducer);
  }
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