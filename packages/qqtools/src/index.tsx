import { createRoot, type Root } from 'react-dom/client';
import { HashRouter } from 'react-router';
import { Provider } from 'react-redux';
import { ConfigProvider, App } from 'antd';
import '@ant-design/v5-patch-for-react-19';
import 'antd/dist/reset.css';
import zhCN from 'antd/locale/zh_CN';
import { magenta } from '@ant-design/colors';
import * as dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import { storeFactory } from './store/store';
import Routers from './router/Routers';
import MDXProvider from './components/basic/MdxProvider/MDXProvider';
import IDBInit from './utils/IDB/IDBInit';
import './entry/main.tailwindcss.css';
import { proxyServerInit } from './utils/proxyServer/proxyServer';
import './components/basic/Accessibility/Accessibility';
import './utils/logProtocol/logProtocolBroadcastChannel';

dayjs.locale('zh-cn');

/* app */
const root: Root = createRoot(document.getElementById('app')!);

root.render(
  <Provider store={ storeFactory() }>
    <ConfigProvider locale={ zhCN }
      theme={{
        token: {
          colorPrimary: magenta.primary
        }
      }}
    >
      <App component={ false }>
        <MDXProvider>
          <HashRouter>
            <Routers />
          </HashRouter>
        </MDXProvider>
      </App>
    </ConfigProvider>
  </Provider>
);

IDBInit();
proxyServerInit();