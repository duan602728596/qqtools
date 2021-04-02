import { useEffect, ReactElement, MouseEvent } from 'react';
import type { Dispatch } from 'redux';
import { useSelector, useDispatch } from 'react-redux';
import { createSelector, createStructuredSelector, Selector } from 'reselect';
import { Button, Space } from 'antd';
import style from './index.sass';
import Header from './Header/Header';
import LoginModal from './LoginModal';
import { setChildProcessWorker, queryQQLoginList, MiraiLoginInitialState } from './reducers/reducers';
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
    </div>
  );
}

export default Index;