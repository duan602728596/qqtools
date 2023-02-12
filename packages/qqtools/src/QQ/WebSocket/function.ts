import { createHash, type Hash } from 'node:crypto';
import { EventEmitter } from 'node:events';

/* 触发事件 */
export class WebSocketEmitter extends EventEmitter {}

export const enum EmitterType {
  Connect = 'connect',
  Open = 'Open',
  Message = 'message',
  Error = 'error',
  Close = 'close'
}

/* 对Sec-Websocket-Key进行加密，作为Sec-Websocket-Accept的值 */
export function encryptSocketKey(key: string): string {
  const WEBSOCKET_GUID: string = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
  const sha1Hash: Hash = createHash('sha1');

  sha1Hash.update(`${ key }${ WEBSOCKET_GUID }`);

  return sha1Hash.digest('base64');
}

type Opcode = number | 1 | 2 | 8 | 9 | 10;
type PayloadData = Buffer | Uint8Array | null;

export interface FrameRecord {
  isFinal?: boolean;
  opcode: Opcode;
  masked?: boolean;
  payloadLen?: number;
  maskingKey?: string | Array<number>;
  payloadData?: PayloadData;
}

/* 处理接收到的数据 */
export function decodeWsFrame(data: Buffer): FrameRecord {
  let start: number = 0;
  const frame: FrameRecord = {
    isFinal: (data[start] & 0x80) === 0x80,
    opcode: data[start++] & 0xF,
    masked: (data[start] & 0x80) === 0x80,
    payloadLen: data[start++] & 0x7F,
    maskingKey: '',
    payloadData: null
  };

  if (frame.payloadLen === 126) {
    frame.payloadLen = (data[start++] << 8) + data[start++];
  } else if (frame.payloadLen === 127) {
    frame.payloadLen = 0;

    for (let i: number = 7; i >= 0; i--) {
      frame.payloadLen += (data[start++] << (i * 8));
    }
  }

  if (frame.payloadLen) {
    if (frame.masked) {
      const maskingKey: Array<number> = [data[start++], data[start++], data[start++], data[start++]];

      frame.maskingKey = maskingKey;
      frame.payloadData = data
        .subarray(start, start + frame.payloadLen)
        .map((byte: number, index: number): number => byte ^ maskingKey[index % 4]);
    } else {
      frame.payloadData = data.slice(start, start + frame.payloadLen);
    }
  }

  return frame;
}

/* 处理发送的数据 */
export function encodeWsFrame(data: FrameRecord): Buffer {
  const isFinal: boolean = data.isFinal !== undefined ? data.isFinal : true,
    opcode: Opcode = data.opcode !== undefined ? data.opcode : 1,
    payloadData: PayloadData = data.payloadData ? Buffer.from(data.payloadData) : null,
    payloadLen: number = payloadData ? payloadData.length : 0;
  const frame: Array<number> = [];

  if (isFinal) {
    frame.push((1 << 7) + opcode);
  } else {
    frame.push(opcode);
  }

  if (payloadLen < 126) {
    frame.push(payloadLen);
  } else if (payloadLen < 65536) {
    frame.push(126, payloadLen >> 8, payloadLen & 0xFF);
  } else {
    frame.push(127);

    for (let i: number = 7; i >= 0; i--) {
      frame.push((payloadLen & (0xFF << (i * 8))) >> (i * 8));
    }
  }

  return payloadData ? Buffer.concat([Buffer.from(frame), payloadData]) : Buffer.from(frame);
}

/* 将字符串解析成method url */
export interface ParseHttpOrWebsocketResult {
  method: string;
  url: string;
  status: string;
}

export function parseHttp(data: string): ParseHttpOrWebsocketResult | undefined {
  const httpMsg: string | undefined = data.split('\r\n')?.[0];

  if (!httpMsg) return;

  const httpMsgArr: Array<string> = httpMsg.split(/\s/);

  return { method: httpMsgArr[0], url: httpMsg[1], status: '' };
}

export function parseWebsocket(data: string): ParseHttpOrWebsocketResult | undefined {
  const httpMsg: string | undefined = data.split('\r\n')?.[0];

  if (!httpMsg) return;

  const httpMsgArr: Array<string> = httpMsg.split(/\s/);

  return { method: '', url: '', status: httpMsgArr[1] };
}

/* 将字符串变成headers record，全小写 */
export function parseHeaders(data: string): Record<string, string> {
  return data.split('\r\n')
    .splice(1)
    .filter((o: string): boolean => o !== '')
    .reduce((result: Record<string, string>, header: string, index: number): Record<string, string> => {
      const [key, value]: Array<string> = header.split(': ');

      result[key.toLowerCase()] = value;

      return result;
    }, {});
}

/* 验证authorization */
export function verifyAuthorization(headerAuthorization: string, token: string): boolean {
  const authorizationStr: Array<string> = headerAuthorization
    .replace(/^\s+/, '')
    .replace(/\s+$/, '')
    .split(/\s/);
  const bearerStr: string | undefined = authorizationStr?.[0]?.toLocaleUpperCase?.();
  const authValue: string | undefined = authorizationStr?.[1];

  return bearerStr === 'bearer' && authValue === this.authorizationToken;
}

/* 创建原始的http报文 */
export function createRawHttpMessage(n: string, headers: Record<string, string> = {}): string {
  const msgArray: string[] = [n];

  for (const key in headers) {
    msgArray.push(`${ key }: ${ headers[key] }`);
  }

  return msgArray.join('\r\n') + '\r\n\r\n';
}