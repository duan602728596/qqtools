import { ipcRenderer } from 'electron';
import {
  Fragment,
  useState,
  useEffect,
  type ReactElement,
  type MouseEvent,
  type Dispatch as D,
  type SetStateAction as S
} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { Dispatch } from '@reduxjs/toolkit';
import { createStructuredSelector, type Selector } from 'reselect';
import { Link } from 'react-router-dom';
import { Button, Space, Table, Checkbox, message, notification, Tooltip, Select } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import type { MessageInstance } from 'antd/es/message/interface';
import type { UseMessageReturnType } from '@qqtools-types/antd';
import { ToolTwoTone as IconToolTwoTone } from '@ant-design/icons';
import style from './index.sass';
import { omit } from '../../utils/lodash';
import Header from './Header/Header';
import LoginModal from './LoginModal';
import {
  setChildProcessWorker,
  queryQQLoginList,
  saveQQLoginItemData,
  deleteQQLoginItem,
  type MiraiLoginInitialState
} from './reducers/reducers';
import dbConfig from '../../utils/IDB/IDBConfig';
import { login, queue } from './login/login';
import type { LoginInfoSendMessage } from './login/miraiChild.worker/miraiChild.worker';
import type { QQLoginItem, ProtocolType } from './types';

/* 登陆 */
async function loginFunc(messageApi: MessageInstance, username: string, password: string): Promise<void> {
  try {
    const [result, loginInfoSendMessage]: [boolean, LoginInfoSendMessage] = await login(username, password);

    if (result) {
      messageApi.success(`[${ username }] 登陆成功！`);
    } else {
      messageApi.error(`[${ username }] ${ loginInfoSendMessage?.message ?? '登陆失败！' }`);
    }
  } catch (err) {
    console.error(err);
    messageApi.error('登陆失败！');
  }
}

/* redux selector */
type RState = { miraiLogin: MiraiLoginInitialState };

const selector: Selector<RState, MiraiLoginInitialState> = createStructuredSelector({
  // worker
  childProcessWorker: ({ miraiLogin }: RState): Worker | null => miraiLogin.childProcessWorker,

  // 账户列表
  qqLoginList: ({ miraiLogin }: RState): Array<QQLoginItem> => miraiLogin.qqLoginList
});

/* 启动mirai */
function Index(props: {}): ReactElement {
  const { childProcessWorker, qqLoginList }: MiraiLoginInitialState = useSelector(selector);
  const dispatch: Dispatch = useDispatch();
  const [messageApi, messageContextHolder]: UseMessageReturnType = message.useMessage();
  const [closeBtnLoading, setCloseBtnLoading]: [boolean, D<S<boolean>>] = useState(false); // 关闭进程的loading

  // 关闭线程
  function handleCloseMiraiWorkerClick(event: MouseEvent): void {
    setCloseBtnLoading(true);

    function handleChildProcessWorkerClose(event1: MessageEvent): void {
      if (event1.data.type === 'close') {
        childProcessWorker!.terminate();
        dispatch(setChildProcessWorker(undefined));
        setCloseBtnLoading(false);
      }
    }

    childProcessWorker!.addEventListener('message', handleChildProcessWorkerClose, false);
    childProcessWorker!.postMessage({ type: 'close' });
  }

  // 删除
  function handleDeleteClick(item: QQLoginItem, event: MouseEvent): void {
    dispatch(deleteQQLoginItem({
      query: item.qq
    }));
  }

  // 允许一键登陆
  function handleAutoLoginChange(item: QQLoginItem, event: CheckboxChangeEvent): void {
    const autoLogin: boolean = event.target.checked;

    dispatch(saveQQLoginItemData({
      data: Object.assign(omit(item, ['autoLogin']), { autoLogin })
    }));
  }

  // 切换协议
  function handleChangeProtocolSelect(item: QQLoginItem, value: ProtocolType): void {
    dispatch(saveQQLoginItemData({
      data: Object.assign(omit(item, ['protocol']), { protocol: value })
    }));
  }

  // 登陆
  function handleLoginClick(item: QQLoginItem, event: MouseEvent): void {
    notification.info({
      message: '账号登陆',
      description: childProcessWorker
        ? `正在登陆账号[${ item.qq }]，请稍等...`
        : `正在启动mirai并登陆账号[${ item.qq }]，请稍等...`
    });

    queue.use([loginFunc, undefined, messageApi, item.qq, item.password, item.protocol]);
    queue.run();
  }

  // 一键登陆
  function handleAutoLoginClick(event: MouseEvent): void {
    notification.info({
      message: '一键登陆',
      description: childProcessWorker ? '正在一键登陆，请稍等...' : '正在启动mirai并一键登陆，请稍等...'
    });

    queue.use(
      ...qqLoginList.filter((o: QQLoginItem): boolean => o.autoLogin)
        .map((o: QQLoginItem): [Function, any, MessageInstance, string, string, ProtocolType | undefined] => {
          return [loginFunc, undefined, messageApi, o.qq, o.password, o.protocol];
        })
    );
    queue.run();
  }

  // 打开开发者工具
  function handleOpenDeveloperToolsClick(event: MouseEvent): void {
    ipcRenderer.send('developer-tools');
  }

  const columns: ColumnsType<QQLoginItem> = [
    { title: '账号', dataIndex: 'qq', width: '160px' },
    { title: '最后登陆时间', dataIndex: 'lastLoginTime' },
    {
      title: '允许一键登陆',
      dataIndex: 'autoLogin',
      width: '270px',
      render: (value: boolean, record: QQLoginItem, index: number): ReactElement => (
        <Fragment>
          <Checkbox className="mr-[8px]"
            checked={ value }
            onChange={ (event: CheckboxChangeEvent): void => handleAutoLoginChange(record, event) }
          />
          <Select className={ style.select }
            size="small"
            value={ record.protocol ?? 'ANDROID_PAD' }
            onSelect={ (val: ProtocolType): void => handleChangeProtocolSelect(record, val) }
          >
            <Select.Option value="ANDROID_PAD">平板(ANDROID_PAD)</Select.Option>
            <Select.Option value="ANDROID_PHONE">手机(ANDROID_PHONE)</Select.Option>
            <Select.Option value="ANDROID_WATCH">手表(ANDROID_WATCH)</Select.Option>
          </Select>
        </Fragment>
      )
    },
    {
      title: '操作',
      key: 'handle',
      width: '96px',
      render: (value: undefined, record: QQLoginItem, index: number): ReactElement => (
        <Button.Group size="small">
          <Button onClick={ (event: MouseEvent): void => handleLoginClick(record, event) }>登陆</Button>
          <Button type="primary"
            danger={ true }
            onClick={ (event: MouseEvent): void => handleDeleteClick(record, event) }
          >
            删除
          </Button>
        </Button.Group>
      )
    }
  ];

  useEffect(function(): void {
    dispatch(queryQQLoginList({
      query: { indexName: dbConfig.objectStore[2].data[0] }
    }));
  }, []);

  return (
    <Fragment>
      <div className="p-[16px]">
        <Header />
        <Space className="mb-[16px]">
          <LoginModal />
          <Button onClick={ handleAutoLoginClick }>一键登陆</Button>
          <Button type="primary"
            danger={ true }
            loading={ closeBtnLoading }
            disabled={ childProcessWorker === null }
            onClick={ handleCloseMiraiWorkerClick }
          >
            关闭mirai
          </Button>
          <div>
            <Tooltip title="开发者工具">
              <Button type="text" icon={ <IconToolTwoTone /> } onClick={ handleOpenDeveloperToolsClick } />
            </Tooltip>
            打开控制台可以查看日志信息
          </div>
          <Link to="/">
            <Button type="primary" danger={ true }>返回</Button>
          </Link>
        </Space>
        <Table size="small"
          bordered={ true }
          dataSource={ qqLoginList }
          columns={ columns }
          rowKey="qq"
          pagination={ false }
        />
      </div>
      { messageContextHolder }
    </Fragment>
  );
}

export default Index;