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
      <div>
        <p>
          <Link to="/Login">登录</Link>
        </p>
        <p>
          <Link to="/">配置</Link>
        </p>
      </div>
    );
  }
}

export default Index;