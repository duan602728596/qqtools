import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import Routers from './router/routers';
import { LocaleProvider } from 'antd';
import zhCN from 'antd/lib/locale-provider/zh_CN';
import store from './store/store';
import './common.sass';

/* app */
ReactDOM.render(
  <Provider store={ store }>
    <LocaleProvider locale={ zhCN }>
      <HashRouter>
        <Routers />
      </HashRouter>
    </LocaleProvider>
  </Provider>,
  document.getElementById('react-app')
);
