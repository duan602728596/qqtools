import * as React from 'react';
import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'antd';
import { QqOutlined as IconQqOutlined, SettingOutlined as IconSettingOutlined } from '@ant-design/icons';
import style from './index.sass';

/* 首页 */
function Index(props: {}): ReactElement {
  return (
    <ul className={ style.nav }>
      <li className={ style.navItem }>
        <Link to="Login">
          <Button type="primary" icon={ <IconQqOutlined /> }>账号登陆</Button>
        </Link>
      </li>
      <li className={ style.navItem }>
        <Link to="Options">
          <Button icon={ <IconSettingOutlined /> }>登陆配置</Button>
        </Link>
      </li>
    </ul>
  );
}

export default Index;