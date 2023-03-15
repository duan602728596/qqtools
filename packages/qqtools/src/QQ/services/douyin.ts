import got, { type Response as GotResponse } from 'got';
import { pcUserAgent, awemePostQuery, type VideoQuery } from '../function/expand/douyin/signUtils';
import type { AwemePostResponse } from './interface';

/**
 * 该方法运行在worker线程中，所以需要和其他依赖隔离
 */

/**
 * 请求user的视频列表
 * @param { string } cookie: string
 * @param { VideoQuery } videoQuery: user id
 */
export async function requestAwemePost(cookie: string, videoQuery: VideoQuery): Promise<AwemePostResponse | string> {
  const query: string = awemePostQuery(videoQuery);
  const res: GotResponse<AwemePostResponse | string> = await got.get(
    `https://www.douyin.com/aweme/v1/web/aweme/post/?${ query }`, {
      responseType: 'json',
      headers: {
        Referer: `https://www.douyin.com/user/${ videoQuery.secUserId }`,
        Host: 'www.douyin.com',
        'User-Agent': pcUserAgent,
        Cookie: cookie
      },
      followRedirect: false
    });

  return res.body;
}