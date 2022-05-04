import { spawn, ChildProcessWithoutNullStreams } from 'node:child_process';
import * as path from 'node:path';
import * as os from 'node:os';
import * as iconv from 'iconv-lite';
import type { ProtocolType } from '../../types';

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
  protocol?: ProtocolType;
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
  message?: string; // 追加一些特殊信息
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

/* 对window系统下的乱码问题进行处理 */
const isWin32Platform: boolean = os.platform() === 'win32'; // 判断是否为window系统
let BufferToString: (chunk: Buffer) => string;

/* 默认的方法 */
function utf8Decode(chunk: Buffer): string {
  return chunk.toString();
}

/* GBK的方法 */
function gbkDecode(chunk: Buffer): string {
  return iconv.decode(chunk, 'GBK');
}

/* 获取当前控制台的编码 */
function chcp(): Promise<string> {
  return new Promise((resolve: Function, reject: Function): void => {
    const child: ChildProcessWithoutNullStreams = spawn('chcp');

    child.stdout.on('data', function(chunk: Buffer): void {
      if (chunk.toString().includes('936')) {
        resolve('GBK');
      } else {
        resolve('utf-8');
      }
    });

    child.on('error', function(err: Error): void {
      console.error(err);
      reject(err);
    });
  });
}

/**
 * 初始化子进程
 * mirai-console-pure     => net.mamoe.mirai.console.pure.MiraiConsolePureLoader
 * mirai-console-terminal => net.mamoe.mirai.console.terminal.MiraiConsoleTerminalLoader
 * 滑块验证参考https://github.com/project-mirai/mirai-login-solver-selenium#%E7%8E%AF%E5%A2%83%E5%87%86%E5%A4%87
 * 滑块获取ticket的地址为https://t.captcha.qq.com/cap_union_new_verify
 */
function childProcessInit(data: InitMessage): void {
  childProcess = spawn(data.javaPath, [
    '-Dmirai.slider.captcha.supported',
    '-cp',
    `${ data.jarDir }/*`,
    'net.mamoe.mirai.console.terminal.MiraiConsoleTerminalLoader'
  ], { cwd: path.join(data.jarDir, '..') });

  childProcess.stdout.on('data', function(chunk: Buffer): void {
    const text: string = BufferToString(chunk);
    const sendData: StdoutEventMessage = { text };

    if (/^>/.test(text) && !isInitialized) {
      isInitialized = true; // 首次启动
      sendData.isFirst = true;
      postMessage({ type: MessageType.INIT } as InitSendMessage);
    }

    stdoutEvent['data'] = sendData;
    dispatchEvent(stdoutEvent);
    console.log(text);
  });

  childProcess.stderr.on('data', function(chunk: Buffer): void {
    console.log(BufferToString(chunk));
  });

  childProcess.on('close', function() {
    postMessage({ type: MessageType.CLOSE } as CloseMessage);
  });

  childProcess.on('error', function(err: Error): void {
    console.error(err);
    postMessage({ type: MessageType.CLOSE, error: err } as CloseMessage);
  });
}

/* 账号的登陆 */
function miraiLogin(data: LoginMessage): void {
  const protocol: ProtocolType = data.protocol ?? 'ANDROID_PAD';

  // 根据监听信息判断是登陆成功还是失败
  function handleStdout(event: MessageEvent<StdoutEventMessage>): void {
    const { text, isFirst }: StdoutEventMessage = event.data;

    if (/Login successful/i.test(text) && text.includes(data.username)) {
      // 登陆成功
      postMessage({
        type: MessageType.LOGIN_INFO,
        loginType: 'success',
        username: data.username
      } as LoginInfoSendMessage);
      removeEventListener(stdoutEvent.type, handleStdout, false);
    } else if (/(Use)?Login failed/i.test(text)) {
      let message: string | undefined;

      if (/无法完成滑块验证/.test(text)) {
        message = '该账号需要滑块验证。';
      } else if (/请更换网络环境或在常用设备上登录或稍后再试/.test(text)) {
        message = '当前上网环境异常，请更换网络环境或在常用设备上登录或稍后再试。';
      }

      // 登陆失败
      postMessage({
        type: MessageType.LOGIN_INFO,
        loginType: 'failed',
        username: data.username,
        message
      } as LoginInfoSendMessage);
      removeEventListener(stdoutEvent.type, handleStdout, false);
    } else if (/^>/.test(text) && isFirst) {
      // 首次启动时需要监听启动完毕后才能登陆
      childProcess.stdin.write(`login ${ data.username } ${ data.password } ${ protocol } \n`);
    }
  }

  addEventListener(stdoutEvent.type, handleStdout, false);

  // 进程存在时直接写入命令
  if (childProcess && isInitialized) {
    childProcess.stdin.write(`login ${ data.username } ${ data.password } ${ protocol } \n`);
  }
}

/* 关闭线程 */
function closeLogin(): void {
  childProcess.kill();
}

addEventListener('message', async function(event: MessageEvent<Message>): Promise<void> {
  const { type }: Message = event.data;

  if (type === MessageType.INIT) {
    // 根据当前控制台的编码获取解析函数
    if (isWin32Platform) {
      let encoding: string;

      try {
        encoding = await chcp();
      } catch {
        encoding = 'utf-8';
      }

      if (encoding === 'GBK') {
        BufferToString = gbkDecode;
      } else {
        BufferToString = utf8Decode;
      }
    } else {
      BufferToString = utf8Decode;
    }

    // 初始化
    childProcessInit(event.data as InitMessage);
  } else if (type === MessageType.LOGIN) {
    miraiLogin(event.data as LoginMessage);
  } else if (type === MessageType.CLOSE) {
    closeLogin();
  }
}, false);