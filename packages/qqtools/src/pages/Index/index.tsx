import { ipcRenderer, shell } from 'electron';
import type { ReactElement, MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { Button, Space, Divider, Image, Tooltip } from 'antd';
import {
  QqOutlined as IconQqOutlined,
  SettingOutlined as IconSettingOutlined,
  QuestionCircleFilled as IconQuestionCircleFilled,
  ToolTwoTone as IconToolTwoTone,
  ClusterOutlined as IconClusterOutlined
} from '@ant-design/icons';
import style from './index.sass';

/* 首页 */
function Index(props: {}): ReactElement {
  // 打开开发者工具
  function handleOpenDeveloperToolsClick(event: MouseEvent): void {
    ipcRenderer.send('developer-tools');
  }

  // 打开使用说明
  function handleOpenHelpClick(event: MouseEvent): void {
    shell.openExternal('https://github.com/duan602728596/qqtools/blob/main/README.md');
  }

  return (
    <div className={ style.main }>
      <h1>qqtools-mirai</h1>
      <Space>
        <Link to="Login">
          <Button type="primary" icon={ <IconQqOutlined /> }>账号登陆</Button>
        </Link>
        <Link to="Options">
          <Button icon={ <IconSettingOutlined /> }>登陆配置</Button>
        </Link>
        <Link to="MiraiLogin">
          <Button icon={ <IconClusterOutlined /> }>mirai登陆</Button>
        </Link>
        <Button icon={ <IconQuestionCircleFilled /> } onClick={ handleOpenHelpClick }>使用说明</Button>
        <Tooltip title="开发者工具">
          <Button type="text" icon={ <IconToolTwoTone /> } onClick={ handleOpenDeveloperToolsClick } />
        </Tooltip>
      </Space>
      <Divider />
      {/* 二维码 */}
      <p>欢迎打赏：</p>
      <Space size={ 8 }>
        <Image className={ style.dashangImage } src={ require('./images/zfb.avif').default } />
        <Image className={ style.dashangImage } src={ require('./images/wx.avif').default } />
      </Space>
    </div>
  );
}

export default Index;