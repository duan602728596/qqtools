import { ipcRenderer, shell } from 'electron';
import * as React from 'react';
import type { ReactElement, MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { Button, Space } from 'antd';
import {
  QqOutlined as IconQqOutlined,
  SettingOutlined as IconSettingOutlined,
  QuestionCircleFilled as IconQuestionCircleFilled,
  ToolFilled as IconToolFilled
} from '@ant-design/icons';
import style from './index.sass';

declare const BUILD_TIME: string;

/* 首页 */
function Index(props: {}): ReactElement {
  // 打开开发者工具
  function handleOpenDeveloperToolsClick(event: MouseEvent): void {
    ipcRenderer.send('developer-tools');
  }

  // 打开使用说明
  function handleOpenHelpClick(event: MouseEvent): void {
    shell.openExternal('https://github.com/duan602728596/qqtools/blob/next/README.md');
  }

  return (
    <div className={ style.main }>
      <h1>qqtools3</h1>
      <p>
        <Button type="text" icon={ <IconToolFilled /> } onClick={ handleOpenDeveloperToolsClick }>
          Build in { BUILD_TIME }.
        </Button>
      </p>
      <Space className={ style.nav }>
        <Link to="Login">
          <Button type="primary" icon={ <IconQqOutlined /> }>账号登陆</Button>
        </Link>
        <Link to="Options">
          <Button icon={ <IconSettingOutlined /> }>登陆配置</Button>
        </Link>
        <Button icon={ <IconQuestionCircleFilled /> } onClick={ handleOpenHelpClick }>使用说明</Button>
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