import { createServer, type Server, type Socket } from 'node:net';
import {
  WebSocketEmitter,
  EmitterType,
  encodeWsFrame,
  decodeWsFrame,
  parseHttp,
  parseHeaders,
  encryptSocketKey,
  verifyAuthorization,
  createRawHttpMessage,
  type ParseHttpOrWebsocketResult,
  type FrameRecord
} from './function';
import { setInterval, clearInterval } from 'node:timers';

/* 单个socket服务 */
interface WebSocketOnceArgs {
  socket: Socket;
  server: WebSocketServer;
}

class WebSocketOnce {
  emitter: WebSocketEmitter = new WebSocketEmitter();
  pingTimer: NodeJS.Timer | number | null = null;
  socket: Socket;
  server: WebSocketServer;
  pingStatus: 1 | 0 = 1;

  constructor(args: WebSocketOnceArgs) {
    this.socket = args.socket;
    this.server = args.server;
    this.socket.on('data', this.handleSocketDataCallback);
    this.pingTimer = setInterval(this.pingTimerFunc, 180_000); // ping
  }

  // 监听事件
  on(type: EmitterType, cb: any): void {
    this.emitter.on(type, cb);
  }

  off(type: EmitterType, cb: any): void {
    this.emitter.off(type, cb);
  }

  // socket end
  socketClose(): void {
    this.pingTimer !== null && clearInterval(this.pingTimer);
    this.socket.end();
    this.server.socketsMap.delete(this.socket);
    this.emitter.emit(EmitterType.Close);
  }

  // 发送ping消息的定时器
  pingTimerFunc: Function = (): void => {
    if (this.pingStatus) {
      this.pingStatus = 0;
      this.socket.write(encodeWsFrame({ opcode: 9 }));
    } else {
      this.socketClose();
    }
  };

  // 接收消息的回调函数
  handleSocketDataCallback: (buffer: Buffer) => void = (buffer: Buffer): void => {
    try {
      const { opcode, payloadData }: FrameRecord = decodeWsFrame(buffer);

      if (opcode === 8) {
        // close socket
        this.socketClose();
      } else if (opcode === 9) {
        // ping
        this.socket.write(encodeWsFrame({ opcode: 10 }));
      } else if (opcode === 10) {
        // pong
        this.pingStatus = 1;
      } else if (opcode === 2 || opcode === 1) {
        // message
        this.emitter.emit(EmitterType.Message, payloadData);
      }
    } catch (err) {
      this.emitter.emit(EmitterType.Error, err);
    }
  };

  // 关闭
  close(): void {
    this.socket.write(encodeWsFrame({ opcode: 8 }));
    this.socketClose();
  }
}

/* 创建websocket server服务 */
interface WebSocketServerArgs {
  port: number;
  url: string;
  authorizationToken?: string;
}

class WebSocketServer {
  port: number;
  url: string;
  authorizationToken?: string;
  server: Server;
  emitter: WebSocketEmitter = new WebSocketEmitter();
  socketsMap: Map<Socket, WebSocketOnce> = new Map();

  constructor(args: WebSocketServerArgs) {
    this.port = args.port;
    this.url = args.url ?? '/';
    this.authorizationToken = args.authorizationToken;
  }

  // 监听事件
  on(type: EmitterType, cb: any): void {
    this.emitter.on(type, cb);
  }

  off(type: EmitterType, cb: any): void {
    this.emitter.off(type, cb);
  }

  // 建立请求
  createConnect(socket: Socket): Promise<boolean> {
    return new Promise((resolve: Function, reject: Function): void => {
      socket.once('data', (buffer: Buffer): void => {
        const data: string = buffer.toString();
        const parseHttpResult: ParseHttpOrWebsocketResult | undefined = parseHttp(data);
        const headers: Record<string, string> = parseHeaders(data);

        // 判断是否为websocket并检查版本
        if (!(
          parseHttpResult?.method === 'GET'
          && parseHttpResult?.url === this.url
          && headers.upgrade === 'websocket'
          && headers['sec-websocket-version'] === '13'
        )) {
          socket.end();
          resolve(false);

          return;
        }

        // 鉴权
        if (this.authorizationToken && !verifyAuthorization(headers.authorization, this.authorizationToken)) {
          socket.end();
          resolve(false);

          return;
        }

        const resHeaders: Record<string, string> = {
          Upgrade: 'websocket',
          Connection: 'Upgrade',
          'Sec-Websocket-Accept': encryptSocketKey(headers['sec-websocket-key'])
        };

        this.authorizationToken && (resHeaders['Authorization'] = `Bearer ${ this.authorizationToken }`);
        socket.write(createRawHttpMessage('HTTP/1.1 101 Switching Protocols', resHeaders));
        resolve(true);
      });
    });
  }

  // createServer的回调函数
  handleCreateServerCallback: (socket: Socket) => Promise<void> = async (socket: Socket): Promise<void> => {
    try {
      if (!(await this.createConnect(socket))) return;

      const wsOnce: WebSocketOnce = new WebSocketOnce({ socket, server: this });

      this.socketsMap.set(socket, wsOnce);
      this.emitter.emit(EmitterType.Connect, wsOnce);
    } catch (err) {
      this.emitter.emit(EmitterType.Error, err);
      socket.end();
    }
  };

  // 创建服务
  createWSServer(): void {
    try {
      this.server = createServer(this.handleCreateServerCallback);
      this.server.listen(this.port);
    } catch (err) {
      this.emitter.emit(EmitterType.Error, err);
    }
  }

  // 关闭
  close(): void {
    this.socketsMap.forEach((value: WebSocketOnce, key: Socket): unknown => value.close());
    this.server.close();
    this.emitter.emit(EmitterType.Close);
  }
}

export default WebSocketServer;