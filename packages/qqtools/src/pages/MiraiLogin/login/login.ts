import type { Store } from '@reduxjs/toolkit';
import { Queue } from '@bbkkbkk/q';
import getMiraiChildWorker from './miraiChild.worker/getMiraiChildWorker';
import type {
  InitMessage,
  LoginMessage,
  InitSendMessage,
  CloseMessage,
  LoginInfoSendMessage
} from './miraiChild.worker/miraiChild.worker';
import { store } from '../../../store/store';
import { setChildProcessWorker, type MiraiLoginInitialState } from '../reducers/reducers';
import { getMclDir } from '../miraiPath';
import type { ProtocolType } from '../types';

export const queue: Queue = new Queue({ workerLen: 1 }); // 用来限制登陆的

/* 初始化worker */
function initWorker(): Promise<Worker> {
  return new Promise((resolve: Function, reject: Function): void => {
    const worker: Worker = getMiraiChildWorker();

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
      mclDir: getMclDir()
    } as InitMessage);
  });
}

/**
 * 登陆
 * @param { Worker } worker
 * @param { string } username
 * @param { string } password
 * @param { ProtocolType } protocol: 登陆协议
 */
export function loginWorker(
  worker: Worker,
  username: string,
  password: string,
  protocol?: ProtocolType
): Promise<LoginInfoSendMessage> {
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
      password,
      protocol
    } as LoginMessage);
  });
}

/**
 * 账号登陆
 * @param { string } username
 * @param { string } password
 * @param { ProtocolType } protocol: 登陆协议
 * @return { [boolean, LoginInfoSendMessage] } 返回是否登陆成功或失败，以及其他信息
 */
export async function login(
  username: string,
  password: string,
  protocol?: ProtocolType
): Promise<[boolean, LoginInfoSendMessage]> {
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

  const result: LoginInfoSendMessage = await loginWorker(worker, username, password, protocol);

  return [result.loginType === 'success', result];
}