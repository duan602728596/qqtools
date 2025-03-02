// @ts-expect-error
import got, { type Response as GotResponse } from 'got';
import type { _AwemePostObject } from '../../../../main/src/logProtocol/logTemplate/douyin.mjs';
import { awemePostQueryV2 } from '../../utils/toutiao/signUtils';
import { UserAgent } from '../../QQ/function/expand/douyin/UserAgent';
import { _douyinLogProtocol } from '../../utils/logProtocol/logActions';
import type { AwemePostResponse } from './interface';

export type * from './interface';

/**
 * 该方法运行在worker线程中，所以需要和其他依赖隔离
 */

/**
 * 请求user的视频列表
 * @param { string } cookie - string
 * @param { string } secUserId - user id
 * @param ABogusSign
 */
export async function requestAwemePostV2(
  cookie: string,
  secUserId: string,
  ABogusSign: (p: string) => Promise<string>
): Promise<AwemePostResponse | string> {
  const awemePostQueryParams: URLSearchParams = awemePostQueryV2(secUserId);
  const a_bogus: string = await ABogusSign(awemePostQueryParams.toString());

  awemePostQueryParams.set('a_bogus', a_bogus);

  const res: GotResponse<AwemePostResponse | string> = await got.get(
    `https://www.douyin.com/aweme/v1/web/aweme/post/?${ awemePostQueryParams.toString() }`, {
      responseType: 'json',
      headers: {
        Referer: `https://www.douyin.com/user/${ secUserId }`,
        Host: 'www.douyin.com',
        'User-Agent': UserAgent.UA,
        Cookie: cookie
      },
      followRedirect: false
    });

  _douyinLogProtocol.post<_AwemePostObject>('awemePost', {
    userId: secUserId,
    response: res.body === '' ? '' : JSON.stringify(res.body, null, 2)
  });

  return res.body;
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