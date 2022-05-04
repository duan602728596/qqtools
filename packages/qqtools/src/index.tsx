import { createRoot, type Root } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/es/locale-provider/zh_CN';
import * as dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import { storeFactory } from './store/store';
import Routers from './router/Routers';
import IDBInit from './utils/IDB/IDBInit';
import './QQ/sdk/BlythE.min';
import './main.tailwindcss.css';

dayjs.locale('zh-cn');

/* app */
const root: Root = createRoot(document.getElementById('app')!);

root.render(
  <Provider store={ storeFactory() }>
    <ConfigProvider locale={ zhCN }>
      <HashRouter>
        <Routers />
      </HashRouter>
    </ConfigProvider>
  </Provider>
);

IDBInit();