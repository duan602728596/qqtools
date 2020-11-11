import { promisify } from 'util';
import { deflate, unzip } from 'zlib';
import jsBase64 from 'js-base64';

/* 桃叭算法node版，用于测试 */
const { fromUint8Array, toUint8Array } = jsBase64;
const deflatePromise = promisify(deflate);
const unzipPromise = promisify(unzip);

/**
 * 加盐混淆
 * @param { Buffer } convert
 */
export function addSalt(convert) {
  const salt = '%#54$^%&SDF^A*52#@7';

  for (let i = 0; i < convert.length; i++) {
    if (i % 2 === 0) {
      const ch = convert[i] ^ salt.charCodeAt(Math.floor(i / 2) % salt.length);

      convert[i] = ch;
    }
  }

  return convert;
}

/**
 * 压缩
 * @param { string } data: 请求数据
 */
export async function encodeData(data) {
  const length = data.length;
  const compressData = await deflatePromise(data);
  const saltData = addSalt(compressData);
  const result = fromUint8Array(saltData);

  return `${ length }$${ result }`;
}

/**
 * 解压缩
 * @param { string } data: 返回的数据
 */
export async function decodeData(data) {
  const source = data.split('$')[1];
  const base64Data = toUint8Array(source);
  const saltData = addSalt(base64Data);
  const unzipData = await unzipPromise(saltData);

  return unzipData.toString('utf8');
}