/* 随机字符串 */
export function rStr(len: number): string {
  const str: string = 'QWERTYUIOPASDFGHJKLZXCVBNM1234567890';
  let result: string = '';

  for (let i: number = 0; i < len; i++) {
    const rIndex: number = Math.floor(Math.random() * str.length);

    result += str[rIndex];
  }

  return result;
}

function $token(): string {
  return Reflect.get(globalThis, '__x6c2adf8__').call();
}

/* 创建请求头 */
export function createHeaders(token?: string): { [key: string]: string } {
  const headers: { [key: string]: string } = {
    pa: $token(),
    'Content-Type': 'application/json;charset=utf-8',
    appInfo: JSON.stringify({
      vendor: 'apple',
      deviceId: `${ rStr(8) }-${ rStr(4) }-${ rStr(4) }-${ rStr(4) }-${ rStr(12) }`,
      appVersion: '6.2.2',
      appBuild: '21080401',
      osVersion: '11.4.1',
      osType: 'ios',
      deviceName: 'iPhone XR',
      os: 'ios'
    }),
    'User-Agent': 'PocketFans201807/6.0.16 (iPhone; iOS 13.5.1; Scale/2.00)',
    'Accept-Language': 'zh-Hans-AW;q=1',
    Host: 'pocketapi.48.cn'
  };

  if (token) {
    headers.token = token;
  }

  return headers;
}

/* 拼接静态文件地址 */
export function source(pathname: string | undefined): string {
  if (!pathname || pathname === '') return '';

  if (/^https?\/{2}/i.test(pathname)) {
    return pathname;
  } else {
    const url: URL = new URL(pathname, 'https://source3.48.cn/');

    return url.href;
  }
}

export function mp4Source(pathname: string): string {
  if (!pathname || pathname === '') return '';

  const url: URL = new URL(pathname, 'https://mp4.48.cn/');

  return url.href;
}