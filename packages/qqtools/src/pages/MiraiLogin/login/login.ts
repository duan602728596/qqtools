import type { Store } from 'redux';
import MiraiChildWorker from 'worker-loader!./miraiChild.worker';
import type { InitMessage, LoginMessage, InitSendMessage, CloseMessage, LoginInfoSendMessage } from './miraiChild.worker';
import { store } from '../../../store/store';
import { setChildProcessWorker, MiraiLoginInitialState } from '../reducers/reducers';
import { getJavaPath, getJarDir } from '../miraiPath';

/* 初始化worker */
function initWorker(): Promise<Worker> {
  return new Promise((resolve: Function, reject: Function): void => {
    const worker: Worker = new MiraiChildWorker();

    function handleWorkerInitMessage(event: MessageEvent<InitSendMessage | CloseMessage>): void {
      const data: InitSendMessage | CloseMessage = event.data;

      worker.removeEventListener('message', handleWorkerInitMessage, false);

      if (data.type === 'init') {
        resolve(worker);
      } else {
        reject(data.error);
      }
    }

    worker.addEventListener('message', handleWorkerInitMessage, false);

    worker.postMessage({
      type: 'init',
      javaPath: getJavaPath(),
      jarDir: getJarDir()
    } as InitMessage);
  });
}

/**
 * 登陆
 * @param { Worker } worker
 * @param { string } username
 * @param { string } password
 */
export function loginWorker(worker: Worker, username: string, password: string): Promise<LoginInfoSendMessage> {
  return new Promise((resolve: Function, reject: Function) => {
    function handleWorkerLoginMessage(event: MessageEvent<LoginInfoSendMessage>): void {
      const data: LoginInfoSendMessage | CloseMessage = event.data;

      worker.removeEventListener('message', handleWorkerLoginMessage, false);

      if (data.type === 'login_info') {
        resolve(data);
      } else {
        reject();
      }
    }

    worker.addEventListener('message', handleWorkerLoginMessage, false);
    worker.postMessage({
      type: 'login',
      username,
      password
    } as LoginMessage);
  });
}

/**
 * 账号登陆
 * @param { string } username
 * @param { string } password
 * @return { boolean } 返回是否登陆成功或失败
 */
export async function login(username: string, password: string): Promise<[boolean, LoginInfoSendMessage]> {
  const { dispatch, getState }: Store = store;
  const { childProcessWorker }: MiraiLoginInitialState = getState().miraiLogin;
  let worker: Worker;

  // 先初始化
  if (!childProcessWorker) {
    worker = await initWorker();

    dispatch(setChildProcessWorker(worker));
  } else {
    worker = childProcessWorker;
  }

  const result: LoginInfoSendMessage = await loginWorker(worker, username, password);

  return [result.loginType === 'success', result];
}