import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import * as path from 'path';

export enum MessageType {
  INIT = 'init',
  LOGIN = 'login',
  CLOSE = 'close',
  LOGIN_INFO = 'login_info'
}

/* 定义接收的消息类型 */
// 初始化
export interface InitMessage {
  type: MessageType.INIT;
  javaPath: string;
  jarDir: string;
}

// 登陆
export interface LoginMessage {
  type: MessageType.LOGIN;
  username: string;
  password: string;
}

// 关闭
export interface CloseMessage {
  type: MessageType.CLOSE;
  error?: Error;
}

export type Message = InitMessage | LoginMessage | CloseMessage;

/* 定义返回的消息类型 */
// 登陆成功或失败
export interface LoginInfoSendMessage {
  type: MessageType.LOGIN_INFO;
  loginType: 'success' | 'failed';
  username: string;
}

// 是否初始化成功
export interface InitSendMessage {
  type: MessageType.INIT;
}

interface StdoutEventMessage {
  isFirst?: boolean;
  text: string;
}

let childProcess: ChildProcessWithoutNullStreams;
let isInitialized: boolean = false; // 判断mirai是否初始化
const stdoutEvent: Event = new Event('mirai-login-child-stdout');

/**
 * 初始化子进程
 * mirai-console-pure     => net.mamoe.mirai.console.pure.MiraiConsolePureLoader
 * mirai-console-terminal => net.mamoe.mirai.console.terminal.MiraiConsoleTerminalLoader
 */
function childProcessInit(data: InitMessage): void {
  childProcess = spawn(data.javaPath, [
    '-cp',
    `${ data.jarDir }/*`,
    'net.mamoe.mirai.console.terminal.MiraiConsoleTerminalLoader'
  ], { cwd: path.join(data.jarDir, '..') });

  childProcess.stdout.on('data', function(chunk: Buffer): void {
    const text: string = chunk.toString();
    const sendData: StdoutEventMessage = { text };

    if (/^>/.test(text) && !isInitialized) {
      isInitialized = true; // 首次启动
      sendData.isFirst = true;
      // @ts-ignore
      postMessage({ type: MessageType.INIT } as InitSendMessage);
    }

    stdoutEvent['data'] = sendData;
    dispatchEvent(stdoutEvent);
    console.log(text);
  });

  childProcess.stderr.on('data', function(chunk: Buffer): void {
    console.log(chunk.toString());
  });

  childProcess.on('close', function() {
    // @ts-ignore
    postMessage({ type: MessageType.CLOSE } as CloseMessage);
  });

  childProcess.on('error', function(err: Error): void {
    console.error(err);
    // @ts-ignore
    postMessage({ type: MessageType.CLOSE, error: Error } as CloseMessage);
  });
}

/* 账号的登陆 */
function miraiLogin(data: LoginMessage): void {
  // 根据监听信息判断是登陆成功还是失败
  function handleStdout(event: MessageEvent<StdoutEventMessage>): void {
    const { text, isFirst }: StdoutEventMessage = event.data;

    if (/Login successful/i.test(text) && text.includes(data.username)) {
      // @ts-ignore 登陆成功
      postMessage({
        type: MessageType.LOGIN_INFO,
        loginType: 'success',
        username: data.username
      } as LoginInfoSendMessage);
      removeEventListener(stdoutEvent.type, handleStdout, false);
    } else if (/UseLogin failed/i.test(text)) {
      // @ts-ignore 登陆失败
      postMessage({
        type: MessageType.LOGIN_INFO,
        loginType: 'failed',
        username: data.username
      } as LoginInfoSendMessage);
      removeEventListener(stdoutEvent.type, handleStdout, false);
    } else if (/^>/.test(text) && isFirst) {
      // 首次启动时需要监听启动完毕后才能登陆
      childProcess.stdin.write(`login ${ data.username } ${ data.password } \n`);
    }
  }

  addEventListener(stdoutEvent.type, handleStdout, false);

  // 进程存在时直接写入命令
  if (childProcess && isInitialized) {
    childProcess.stdin.write(`login ${ data.username } ${ data.password } \n`);
  }
}

/* 关闭线程 */
function closeLogin(): void {
  childProcess.kill();
}

addEventListener('message', function(event: MessageEvent<Message>) {
  const { type }: Message = event.data;

  if (type === MessageType.INIT) {
    // 初始化
    childProcessInit(event.data as InitMessage);
  } else if (type === MessageType.LOGIN) {
    miraiLogin(event.data as LoginMessage);
  } else if (type === MessageType.CLOSE) {
    closeLogin();
  }
}, false);