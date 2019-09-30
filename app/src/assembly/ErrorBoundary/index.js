/**
 * 错误捕捉模块
 * 当模块报错时，显示错误
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import style from './index.sass';

class ErrorBoundary extends Component {
  static propTypes = {
    children: PropTypes.node
  };

  state = {
    hasError: false,
    error: undefined,
    info: undefined
  };

  componentDidCatch(error, info) {
    this.setState({
      hasError: true,
      error,
      info
    });
  }

  render() {
    const { props, state } = this;
    const { hasError, error, info } = state;

    if (hasError) {
      return (
        <div>
          <h1 className={ style.title }>错误警告：</h1>
          <h2 className={ style.secondTitle }>Error:</h2>
          <pre className={ style.pre }>{ error.stack }</pre>
          <h2 className={ style.secondTitle }>Info:</h2>
          <pre className={ style.pre }>{ info.componentStack }</pre>
        </div>
      );
    } else {
      return props.children;
    }
  }
}

export default ErrorBoundary;