import { useEffect, ReactElement, MouseEvent } from 'react';
import type { Dispatch } from 'redux';
import { useSelector, useDispatch } from 'react-redux';
import { createSelector, createStructuredSelector, Selector } from 'reselect';
import { Button, Space, Table, Checkbox } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import { omit } from 'lodash-es';
import style from './index.sass';
import Header from './Header/Header';
import LoginModal from './LoginModal';
import {
  setChildProcessWorker,
  queryQQLoginList,
  saveQQLoginItemData,
  deleteQQLoginItem,
  MiraiLoginInitialState
} from './reducers/reducers';
import dbConfig from '../../utils/idb/dbConfig';
import type { QQLoginItem } from './types';

/* redux selector */
const selector: Selector<any, MiraiLoginInitialState> = createStructuredSelector({
  // worker
  childProcessWorker: createSelector(
    ({ miraiLogin }: { miraiLogin: MiraiLoginInitialState }): Worker | null => miraiLogin.childProcessWorker,
    (data: Worker | null): Worker | null => (data)
  ),

  // 账户列表
  qqLoginList: createSelector(
    ({ miraiLogin }: { miraiLogin: MiraiLoginInitialState }): Array<QQLoginItem> => miraiLogin.qqLoginList,
    (data: Array<QQLoginItem>): Array<QQLoginItem> => (data)
  )
});

/* 启动mirai */
function Index(props: {}): ReactElement {
  const { childProcessWorker, qqLoginList }: MiraiLoginInitialState = useSelector(selector);
  const dispatch: Dispatch = useDispatch();

  // 关闭线程
  function handleCloseMiraiWorkerClick(event: MouseEvent<HTMLButtonElement>): void {
    function handleChildProcessWorkerClose(event1: MessageEvent): void {
      if (event1.data.type === 'close') {
        childProcessWorker!.terminate();
        dispatch(setChildProcessWorker(undefined));
      }
    }

    childProcessWorker!.addEventListener('message', handleChildProcessWorkerClose, false);
    childProcessWorker!.postMessage({ type: 'close' });
  }

  // 删除
  function handleDeleteClick(item: QQLoginItem, event: MouseEvent<HTMLButtonElement>): void {
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

  const columns: ColumnsType<QQLoginItem> = [
    { title: '账号', dataIndex: 'qq', width: '25%' },
    { title: '最后登陆时间', dataIndex: 'lastLoginTime', width: '25%' },
    {
      title: '允许一键登陆',
      dataIndex: 'autoLogin',
      width: '25%',
      render: (value: boolean, record: QQLoginItem, index: number): ReactElement => (
        <Checkbox checked={ value }
          onChange={ (event: CheckboxChangeEvent): void => handleAutoLoginChange(record, event) }
        />
      )
    },
    {
      title: '操作',
      key: 'handle',
      width: '25%',
      render: (value: undefined, record: QQLoginItem, index: number): ReactElement => (
        <Button type="primary"
          size="small"
          danger={ true }
          onClick={ (event: MouseEvent<HTMLButtonElement>): void => handleDeleteClick(record, event) }
        >
          删除
        </Button>
      )
    }
  ];

  useEffect(function(): void {
    dispatch(queryQQLoginList({
      query: { indexName: dbConfig.objectStore[2].data[0] }
    }));
  }, []);

  return (
    <div className={ style.content }>
      <Header />
      <Space className={ style.marginBottom }>
        <LoginModal />
        <Button>一键登陆</Button>
        <Button type="primary" danger={ true } disabled={ childProcessWorker === null } onClick={ handleCloseMiraiWorkerClick }>
          关闭mirai
        </Button>
      </Space>
      <Table size="small"
        bordered={ true }
        dataSource={ qqLoginList }
        columns={ columns }
        rowKey="qq"
        pagination={ false }
      />
    </div>
  );
}

export default Index;