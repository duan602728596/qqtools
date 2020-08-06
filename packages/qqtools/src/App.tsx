import * as React from 'react';
import type { ReactElement } from 'react';
import { HashRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/es/locale-provider/zh_CN';
import { hot } from '@sweet-milktea/milktea/react-hot-loader/root';
import { storeFactory } from './store/store';
import Routers from './router/Routers';

function App(props: {}): ReactElement {
  return (
    <Provider store={ storeFactory() }>
      <ConfigProvider locale={ zhCN }>
        <HashRouter>
          <Routers />
        </HashRouter>
      </ConfigProvider>
    </Provider>
  );
}

export default hot(App);