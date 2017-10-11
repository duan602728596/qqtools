// @flow
import jQuery from 'jquery';
const https = node_require('https');
const http = node_require('http');
const url = node_require('url');

const USER_AGENT: string = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.81 Safari/537.36';
const HEADER: Object = {
  'Connection': 'keep-alive',
  'User-Agent': USER_AGENT
};

/**
 * 将cookie 字符串转换成Object
 * @param { string } str: cookie字符串
 * @return { Object }
 */
export function cookieStr2Obj(str: string[]): Object{
  const obj: Object = {};
  jQuery.each(str, (index: number, item: string): void=>{
    const str2: string[] = item.split(/;\s*/g);
    jQuery.each(str2, (index2: number, item2: string): void=>{
      if(item2 !== ''){
        const x: string[] = item2.split('=');
        if(x[1] !== '') obj[x[0]] = x[1];
      }
    });
  });
  return obj;
}

/**
 * 将cookie Object转换成字符串
 * @param { Object } obj: cookie Object
 * @return { string }
 */
export function cookieObj2Str(obj: Object): string{
  let str: string = '';
  jQuery.each(obj, (key: string, value: string): void=>{
    str += `${ key }=${ value }; `;
  });
  return str;
}

/**
 * 请求
 * @param { string } reqUrl          : 请求地址
 * @param { string } method          : 请求方式
 * @param { Object } data            : 请求参数
 * @param { Object } headers         : 请求头
 * @param { string | null } setEncode: 编码
 * @return { Promise }
 */
export function request({ reqUrl, method = 'GET', data = '', headers = {}, setEncode }: {
  reqUrl: string,
  method: string,
  data: Object,
  headers: Object,
  setEncode: ?string,
  timeout: ?number
}): Promise{
  const { protocol, hostname, path, port }: {
    protocol: string,
    hostname: string,
    path: string,
    port: ?number
  } = url.parse(reqUrl);

  const options: Object = {
    protocol,
    hostname,
    path,
    port,
    method,
    headers: Object.assign(HEADER, headers)
  };

  return new Promise((resolve: Function, reject: Function): void=>{
    const req: Object = (protocol === 'https:' ? https : http).request(options, (res: Object): void=>{
      let getData: any = null;
      if(setEncode) res.setEncoding(setEncode);

      res.on('data', function(chunk: any): void{
        if(!getData){
          getData = chunk;
        }else{
          getData += chunk;
        }
      });
      res.on('end', function(): void{
        const cookies: ?Array = res.headers['set-cookie'];
        resolve([getData, cookies ? cookieStr2Obj(cookies) : {}]);
      });
    });

    req.on('error', function(err: any): void{
      console.error('请求错误：' + err);
    });
    req.write(data);
    req.end();
  });
}

/**
 * 解密算法
 * @param { string } t
 * @return { number }
 */
export function hash33(t: string): number{
  let e: number = 0;
  let i: number = 0;
  const n: number = t.length;
  while(n > i){
    e += (e << 5) + t.charCodeAt(i);
    i += 1;
  }

  return 2147483647 & e;
}

/**
 * 加密算法
 * @param { number } uin
 * @param { string } ptwebqq
 * @return { string }
 */
export function hash(uin: number, ptwebqq: string): string{
  const N: number[] = [0, 0, 0, 0];
  const k: number = ptwebqq.length;
  let t: number = 0;
  while(t < k){
    N[t % 4] ^= ptwebqq.charCodeAt(t);
    t += 1;
  }

  const V = [
    ((uin >> 24) & 255) ^ 'E'.charCodeAt(0),
    ((uin >> 16) & 255) ^ 'C'.charCodeAt(0),
    ((uin >> 8)  & 255) ^ 'O'.charCodeAt(0),
    ( uin        & 255) ^ 'K'.charCodeAt(0)
  ];

  const U1: number[] = [0, 0, 0, 0, 0, 0, 0, 0];
  const k1 = U1.length;
  let t1: number = 0;
  while(t1 < k1){
    if(t1 % 2 === 0){
      U1[t1] = N[t1 >> 1];
    }else{
      U1[t1] = V[t1 >> 1];
    }
    t1 += 1;
  }

  const N1: string[] = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];
  let V1: string = '';
  U1.map((item: number, index: number): void=>{
    V1 += N1[(item >> 4) & 15];
    V1 += N1[item & 15];
  });

  return V1;
}

/* 计算msg_id */
let sequence: number = 0;
let t: number = new Date().getTime() * 100;
t = (t - t % 1000) / 1000;
t = t % 10000 * 10000;

export function msgId(){
  sequence += 1;
  return t + sequence;
}