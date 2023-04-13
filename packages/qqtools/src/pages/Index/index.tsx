import { ipcRenderer, shell } from 'electron';
import type { ReactElement, MouseEvent } from 'react';
import { Button, Space, Divider, Image, Tooltip } from 'antd';
import Icon, {
  QqOutlined as IconQqOutlined,
  SettingOutlined as IconSettingOutlined,
  QuestionCircleFilled as IconQuestionCircleFilled,
  ToolTwoTone as IconToolTwoTone,
  ClusterOutlined as IconClusterOutlined,
  BugTwoTone as IconBugTwoTone
} from '@ant-design/icons';
import IconVSCodeSvgComponent from './images/vscode.component.svg';
import ButtonLink from '../../components/ButtonLink/ButtonLink';

const IconVSCode: ReactElement = <Icon component={ IconVSCodeSvgComponent } />;

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
      <nav className="grid grid-cols-4 gap-[16px] w-[755px]">
        <div>
          <ButtonLink linkProps={{ to: 'Login' }} buttonProps={{ type: 'primary', icon: <IconQqOutlined />, block: true }}>
            账号登陆
          </ButtonLink>
        </div>
        <div>
          <ButtonLink linkProps={{ to: 'Options' }} buttonProps={{ icon: <IconSettingOutlined />, block: true }}>
            登陆配置
          </ButtonLink>
        </div>
        <div>
          <ButtonLink linkProps={{ to: 'MiraiLogin' }} buttonProps={{ icon: <IconClusterOutlined />, danger: true, block: true }}>
            Mirai登录
          </ButtonLink>
        </div>
        <div>
          <Button icon={ <IconQuestionCircleFilled /> } block={ true } onClick={ handleOpenHelpClick }>使用说明</Button>
        </div>
      </nav>
      <Divider />
      <nav className="grid grid-cols-4 gap-[16px] w-[755px]">
        <div>
          <ButtonLink linkProps={{ to: 'CodeEditor' }} buttonProps={{ icon: IconVSCode, block: true }}>代码编辑器</ButtonLink>
        </div>
      </nav>
      <Divider />
      <Space>
        <Tooltip title="开发者工具">
          <Button type="text" icon={ <IconToolTwoTone /> } onClick={ handleOpenDeveloperToolsClick } />
        </Tooltip>
        <Tooltip title="问题反馈">
          <Button type="text" icon={ <IconBugTwoTone /> } onClick={ handleOpenIssuesClick } />
        </Tooltip>
        <ButtonLink linkProps={{ to: '/Credits' }} buttonProps={{ type: 'text' }}>License</ButtonLink>
      </Space>
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