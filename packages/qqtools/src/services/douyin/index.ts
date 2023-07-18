import got, { type Response as GotResponse } from 'got';
import type { _AwemePostObject } from '@qqtools3/main/src/logProtocol/logTemplate/douyin';
import { douyinUserAgent, awemePostQuery } from '../../utils/toutiao/signUtils';
import { _douyinLogProtocol } from '../../utils/logProtocol/logActions';
import type { AwemePostResponse } from './interface';

export type * from './interface';

/**
 * 该方法运行在worker线程中，所以需要和其他依赖隔离
 */

/**
 * 请求user的视频列表
 * @param { string } cookie: string
 * @param { string } secUserId: user id
 */
export async function requestAwemePostBrowser(cookie: string, secUserId: string): Promise<AwemePostResponse | string> {
  const query: string = awemePostQuery(secUserId);
  const res: Response = await fetch(`https://www.douyin.com/aweme/v1/web/aweme/post/?${ query }`, {
    method: 'GET',
    headers: {
      cookie0: cookie,
      secuserid0: secUserId,
      ua0: douyinUserAgent
    }
  });
  const responseText: string = await res.text();
  const result: AwemePostResponse | string = responseText === '' ? '' : JSON.parse(responseText);

  _douyinLogProtocol.post<_AwemePostObject>('awemePost', {
    userId: secUserId,
    response: result === '' ? '' : JSON.stringify(result, null, 2)
  });

  return result;
}

/* 请求ttwid */
export async function requestTtwidCookie(): Promise<string> {
  const res: GotResponse = await got.post('https://ttwid.bytedance.com/ttwid/union/register/', {
    responseType: 'json',
    json: {
      region: 'union',
      aid: 1768,
      needFid: false,
      service: 'www.ixigua.com',
      migrate_info: { ticket: '', source: 'source' },
      cbUrlProtocol: 'https',
      union: true
    }
  });

  const cookie: Array<string> = [];

  if (res.headers?.['set-cookie']) {
    for (const cookieStr of res.headers['set-cookie']) {
      cookie.push(cookieStr);
    }
  }

  return cookie.join('; ');
}