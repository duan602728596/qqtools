import { ipcRenderer, shell } from 'electron';
import type { ReactElement, MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { Button, Space, Divider, Image, Tooltip } from 'antd';
import {
  QqOutlined as IconQqOutlined,
  SettingOutlined as IconSettingOutlined,
  QuestionCircleFilled as IconQuestionCircleFilled,
  ToolTwoTone as IconToolTwoTone,
  ClusterOutlined as IconClusterOutlined,
  BugTwoTone as IconBugTwoTone
} from '@ant-design/icons';
import License from './License/License';

// 打开开发者工具
function handleOpenDeveloperToolsClick(event: MouseEvent): void {
  ipcRenderer.send('developer-tools');
}

// 打开使用说明
function handleOpenHelpClick(event: MouseEvent): void {
  shell.openExternal('https://www.yuque.com/bbkkbkk/qqtools');
}

// 打开issues
function handleOpenIssuesClick(event: MouseEvent): void {
  shell.openExternal('https://github.com/duan602728596/qqtools/issues');
}

// 打开软件下载地址
function handleOpenDownloadUrlClick(event: MouseEvent): void {
  shell.openExternal('https://github.com/duan602728596/qqtools/releases');
}

/* 首页 */
function Index(props: {}): ReactElement {
  return (
    <div className="p-[16px]">
      <div>
        <Space className="mb-[16px]">
          <Link to="Login">
            <Button type="primary" icon={ <IconQqOutlined /> }>账号登陆</Button>
          </Link>
          <Link to="Options">
            <Button icon={ <IconSettingOutlined /> }>登陆配置</Button>
          </Link>
        </Space>
      </div>
      <div>
        <Space>
          <Link to="MiraiLogin">
            <Button icon={ <IconClusterOutlined /> } danger={ true }>mirai登录（不推荐）</Button>
          </Link>
          <Button icon={ <IconQuestionCircleFilled /> } onClick={ handleOpenHelpClick }>使用说明</Button>
          <Tooltip title="开发者工具">
            <Button type="text" icon={ <IconToolTwoTone /> } onClick={ handleOpenDeveloperToolsClick } />
          </Tooltip>
          <Tooltip title="问题反馈">
            <Button type="text" icon={ <IconBugTwoTone /> } onClick={ handleOpenIssuesClick } />
          </Tooltip>
          <License />
        </Space>
      </div>
      <Divider />
      <div className="flex">
        <div>
          {/* 二维码 */}
          <p>欢迎打赏：</p>
          <Space size={ 8 }>
            <div className="w-[180px]">
              <Image className="cursor-pointer" src={ require('./images/zfb.avif') } />
            </div>
            <div className="w-[180px]">
              <Image className="cursor-pointer" src={ require('./images/wx.avif') } />
            </div>
          </Space>
        </div>
        <div className="ml-[32px]">
          <p>软件最新版本下载地址：</p>
          <Button type="link" onClick={ handleOpenDownloadUrlClick }>
            https://github.com/duan602728596/qqtools/releases
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Index;