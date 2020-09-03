import { promisify } from 'util';
import { deflate, unzip, InputType } from 'zlib';
import { fromUint8Array, toUint8Array } from 'js-base64';

type ZlibPromiseFunc = (arg1: InputType) => Promise<Buffer>;

const deflatePromise: ZlibPromiseFunc = promisify<InputType, Buffer>(deflate);
const unzipPromise: ZlibPromiseFunc = promisify<InputType, Buffer>(unzip);

/**
 * 加盐混淆
 * @param { Buffer } convert
 */
export function addSalt(convert: Buffer): Buffer {
  const salt: string = '%#54$^%&SDF^A*52#@7';

  for (let i: number = 0; i < convert.length; i++) {
    if (i % 2 === 0) {
      const ch: number = convert[i] ^ salt.charCodeAt(Math.floor(i / 2) % salt.length);

      convert[i] = ch;
    }
  }

  return convert;
}

/**
 * 压缩
 * @param { string } data: 请求数据
 */
export async function encodeData(data: string): Promise<string> {
  const length: number = data.length;
  const compressData: Buffer = await deflatePromise(data);
  const saltData: Buffer = addSalt(compressData);
  const result: string = fromUint8Array(saltData);

  return `${ length }$${ result }`;
}

/**
 * 解压缩
 * @param { string } data: 返回的数据
 */
export async function decodeData(data: string): Promise<string> {
  const source: string = data.split('$')[1];
  const base64Data: Buffer = toUint8Array(source);
  const saltData: Buffer = addSalt(base64Data);
  const unzipData: Buffer = await unzipPromise(saltData);

  return unzipData.toString('utf8');
}

export function timeDifference(endTime: number): string {
  const endTimeDate: Date = new Date(endTime);
  const nowTimeDate: Date = new Date();
  // time
  const endTimeNumber: number = endTimeDate.getTime();
  const nowTimeNumber: number = nowTimeDate.getTime();

  let day: number = 0;
  let hour: number = 0;
  let minute: number = 0;
  let second: number = 0;

  if (nowTimeNumber >= endTimeNumber) {
    return '0秒';
  }

  const cha: number = parseInt(String((nowTimeNumber - endTimeNumber) / 1000));

  // 计算天数
  day = Math.floor(cha / 86400);

  // 计算小时
  const dayRemainder: number = cha % 86400;

  hour = Math.floor(dayRemainder / 3600);

  // 计算分钟
  const hourRemainder: number = dayRemainder % 3600;

  minute = Math.floor(hourRemainder / 60);

  // 计算秒
  second = hourRemainder % 60;

  let str: string = '';

  if (day > 0) str += `${ day }天${ hour }时${ minute }分`;

  else if (hour > 0) str += `${ hour }时${ minute }分`;

  else if (minute > 0) str += `${ minute }分`;

  str += `${ second }秒`;

  return str;
}