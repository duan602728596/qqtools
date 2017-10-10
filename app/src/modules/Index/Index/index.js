// @flow
/* 软件首页 */
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { createSelector, createStructuredSelector } from 'reselect';
import { Link, withRouter } from 'react-router-dom';
const gui = node_require('nw.gui');

@withRouter
class Index extends Component{
  render(): Object{
    return (
      <div>首页</div>
    );
  }
}

export default Index;