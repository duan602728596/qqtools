import { Socket } from 'node:net';
import { randomUUID } from 'node:crypto';
import {
  WebSocketEmitter,
  EmitterType,
  encodeWsFrame,
  decodeWsFrame,
  parseWebsocket,
  parseHeaders,
  encryptSocketKey,
  verifyAuthorization,
  createRawHttpMessage,
  type ParseHttpOrWebsocketResult,
  type FrameRecord
} from './function';

/* 创建websocket client服务 */
interface WebSocketClientArgs {
  port: number;
  host?: string;
  url: string;
  authorizationToken?: string;
}

class WebSocketClient {
  client: Socket = new Socket();
  port: number;
  host: string;
  url: string;
  authorizationToken?: string;
  emitter: WebSocketEmitter = new WebSocketEmitter();
  uuid: string = randomUUID();

  constructor(args: WebSocketClientArgs) {
    this.port = args.port;
    this.host = args.host ?? '127.0.0.1';
    this.url = args.url ?? '';
    this.authorizationToken = args.authorizationToken;
  }

  // 接收消息的回调函数
  handleSocketDataCallback: (buffer: Buffer) => void = (buffer: Buffer): void => {
    try {
      const { opcode, payloadData }: FrameRecord = decodeWsFrame(buffer);

      if (opcode === 8) {
        // close socket
        this.client.end();
        this.emitter.emit(EmitterType.Close);
      } else if (opcode === 9) {
        // ping
        this.client.write(encodeWsFrame({ opcode: 10 }));
      } else if (opcode === 10) {
        // pong
      } else if (opcode === 2 || opcode === 1) {
        // message
        this.emitter.emit(EmitterType.Message, payloadData);
      }
    } catch (err) {
      this.emitter.emit(EmitterType.Error, err);
    }
  };

  // 建立请求
  createConnect(): Promise<boolean> {
    return new Promise((resolve: Function, reject: Function) => {
      this.client.once('data', (buffer: Buffer): void => {
        const data: string = buffer.toString();
        const parseWebsocketResult: ParseHttpOrWebsocketResult | undefined = parseWebsocket(data);
        const headers: Record<string, string> = parseHeaders(data);

        if (!(
          parseWebsocketResult?.status === '101'
          && headers.upgrade === 'websocket'
          && headers['sec-websocket-accept'] === encryptSocketKey(this.uuid)
        )) {
          this.client.end();
          resolve(false);

          return;
        }

        // 鉴权
        if (this.authorizationToken && !verifyAuthorization(headers.authorization, this.authorizationToken)) {
          this.client.end();
          resolve(false);

          return;
        }

        resolve(true);
      });
    });
  }

  // connect的回调函数
  handleConnectCallback: () => Promise<void> = async () => {
    try {
      const reqHeaders: Record<string, string> = {
        Upgrade: 'websocket',
        Connection: 'Upgrade',
        'Sec-WebSocket-Key': this.uuid,
        'Sec-WebSocket-Version': '13'
      };

      this.authorizationToken && (reqHeaders['Authorization'] = `Bearer ${ this.authorizationToken }`);
      this.client.write(createRawHttpMessage(`GET ${ this.url } HTTP/1.1`, reqHeaders));

      if (!(await this.createConnect())) return;

      this.client.on('data', this.handleSocketDataCallback);
      this.emitter.emit(EmitterType.Open);
    } catch (err) {
      this.emitter.emit(EmitterType.Error, err);
      this.client.end();
    }
  };

  // 创建服务
  createWSClient(): void {
    try {
      this.client.connect(this.port, this.host, this.handleConnectCallback);
    } catch (err) {
      this.emitter.emit(EmitterType.Error, err);
    }
  }
}

export default WebSocketClient;