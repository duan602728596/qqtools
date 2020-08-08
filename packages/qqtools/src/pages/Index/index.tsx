import * as React from 'react';
import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { Button, Space } from 'antd';
import { QqOutlined as IconQqOutlined, SettingOutlined as IconSettingOutlined } from '@ant-design/icons';
import style from './index.sass';

declare const BUILD_TIME: string;

/* 首页 */
function Index(props: {}): ReactElement {
  return (
    <div className={ style.main }>
      <h1>qqtools3</h1>
      <p>Build in { BUILD_TIME }.</p>
      <Space className={ style.nav }>
        <Link to="Login">
          <Button type="primary" icon={ <IconQqOutlined /> }>账号登陆</Button>
        </Link>
        <Link to="Options">
          <Button icon={ <IconSettingOutlined /> }>登陆配置</Button>
        </Link>
      </Space>
      {/* 二维码 */}
      <p>欢迎打赏：</p>
      <Space>
        <img className={ style.dashangImage } src={ require('./images/zfb.webp').default } />
        <img className={ style.dashangImage } src={ require('./images/wx.webp').default } />
      </Space>
    </div>
  );
}

export default Index;