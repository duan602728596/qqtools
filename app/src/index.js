import React from 'react';
import { render } from 'react-dom';
import { HashRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import Routers from './router/Routers';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/es/locale-provider/zh_CN';
import { storeFactory } from './store/store';
import './components/upgradeDetection/upgradeDetection';
import ErrorBoundary from './assembly/ErrorBoundary/index';

/* app */
render(
  <Provider store={ storeFactory(window.__INITIAL_STATE__ || {}) }>
    <ConfigProvider locale={ zhCN }>
      <HashRouter>
        <ErrorBoundary>
          <Routers />
        </ErrorBoundary>
      </HashRouter>
    </ConfigProvider>
  </Provider>,
  document.getElementById('app')
);