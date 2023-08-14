import { ipcRenderer, shell } from 'electron';
import type { ReactElement, ReactNode, MouseEvent } from 'react';
import { Button, Space, Divider, Image, Tooltip } from 'antd';
import Icon, {
  QqOutlined as IconQqOutlined,
  SettingOutlined as IconSettingOutlined,
  FileSyncOutlined as IconFileSyncOutlined,
  ToolTwoTone as IconToolTwoTone,
  ClusterOutlined as IconClusterOutlined,
  BugTwoTone as IconBugTwoTone
} from '@ant-design/icons';
import { WinIpcChannel } from '@qqtools3/main/src/channelEnum';
import ButtonLink from '../../components/ButtonLink/ButtonLink';
import ExecutablePath from './ExecutablePath/ExecutablePath';
import IconVSCodeSvgComponent from './images/vscode.component.svg';

interface NativeItem {
  name: string;
  url: string;
  icon: ReactElement;
  danger?: boolean;
}

const IconVSCode: ReactElement = <Icon component={ IconVSCodeSvgComponent } />;

// 打开开发者工具
function handleOpenDeveloperToolsClick(event: MouseEvent): void {
  ipcRenderer.send(WinIpcChannel.DeveloperTools);
}

// 打开使用说明
function handleOpenHelpClick(event: MouseEvent): void {
  shell.openExternal('https://yzb1g5r02h.feishu.cn/docx/R123d4UKKovQx0x1dM2cDce7n9c');
}

// 打开issues
function handleOpenIssuesClick(event: MouseEvent): void {
  shell.openExternal('https://github.com/duan602728596/qqtools/issues');
}

// 打开软件下载地址
function handleOpenDownloadUrlClick(event: MouseEvent): void {
  shell.openExternal('https://github.com/duan602728596/qqtools/releases');
}

/* 导航配置 */
const navLinkConfig: Array<Array<NativeItem>> = [
  [
    {
      name: '账号登陆',
      url: '/Login',
      icon: <IconQqOutlined />
    },
    {
      name: '登陆配置',
      url: '/Options',
      icon: <IconSettingOutlined />
    },
    {
      name: 'Mirai登录',
      url: '/MiraiLogin',
      icon: <IconClusterOutlined />,
      danger: true
    },
    {
      name: '代码编辑器',
      url: '/CodeEditor',
      icon: IconVSCode
    }
  ]
];

/* 导航渲染 */
function nativeRender(): Array<ReactNode> {
  const element: Array<ReactElement> = [];

  for (let i: number = 0, j: number = navLinkConfig.length; i < j; i++) {
    const group: Array<NativeItem> = navLinkConfig[i];
    const groupElement: Array<ReactElement> = [];

    for (const navItem of group) {
      groupElement.push(
        <div key={ navItem.name }>
          <ButtonLink linkProps={{ to: navItem.url }}
            buttonProps={{
              icon: navItem.icon,
              block: true,
              danger: navItem.danger
            }}
          >
            { navItem.name }
          </ButtonLink>
        </div>
      );
    }

    element.push(
      <nav key={ `nav-${ i }` } className="grid grid-cols-4 gap-[16px] w-[755px]">
        { groupElement }
      </nav>,
      <Divider key={ `driver-${ i }` } />
    );
  }

  return element;
}

/* 首页 */
function Index(props: {}): ReactElement {
  return (
    <div className="p-[16px]">
      { nativeRender() }
      <div>
        <Space>
          <ExecutablePath />
          <Button icon={ <IconFileSyncOutlined /> } onClick={ handleOpenHelpClick }>
            使用手册
          </Button>
          <Tooltip title="开发者工具">
            <Button type="text" icon={ <IconToolTwoTone /> } onClick={ handleOpenDeveloperToolsClick } />
          </Tooltip>
          <Tooltip title="问题反馈">
            <Button type="text" icon={ <IconBugTwoTone /> } onClick={ handleOpenIssuesClick } />
          </Tooltip>
          <ButtonLink linkProps={{ to: '/Credits' }} buttonProps={{ type: 'text' }}>License</ButtonLink>
        </Space>
      </div>
      <Divider />
      <div>
        <p>
          本软件为免费软件，
          <b>使用及传播均不收取任何费用</b>
          。为了避免您的财产损失，请在
          <Button type="link" onClick={ handleOpenDownloadUrlClick }>
            https://github.com/duan602728596/qqtools/releases
          </Button>
          下载软件的最新版本。如果你想要赞助作者，请扫码打赏。
        </p>
        <Space size={ 8 }>
          <div className="w-[180px]">
            <Image className="cursor-pointer" src={ require('./images/zfb.avif') } />
          </div>
          <div className="w-[180px]">
            <Image className="cursor-pointer" src={ require('./images/wx.avif') } />
          </div>
        </Space>
      </div>
    </div>
  );
}

export default Index;