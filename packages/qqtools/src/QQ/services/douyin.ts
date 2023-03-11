import got, { type Response as GotResponse } from 'got';
import type { VideoQuery } from '../qq.types';
import type { AwemePostResponse } from './interface';

/**
 * 该方法运行在worker线程中，所以需要和其他依赖隔离
 */

const pcUserAgent: string = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 '
  + '(KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36 Edg/109.0.1518.52';

/* 随机字符串 */
function rStr(len: number): string {
  const str: string = 'QWERTYUIOPASDFGHJKLZXCVBNM1234567890';
  let result: string = '';

  for (let i: number = 0; i < len; i++) {
    const rIndex: number = Math.floor(Math.random() * str.length);

    result += str[rIndex];
  }

  return result;
}

/**
 * 请求抖音的user
 * @param { string } userId: 抖音网页版那一长串的ID
 * @param { string } cookie: 登录后的cookie
 */
export async function requestDouyinUser(userId: string, cookie: string): Promise<string> {
  const res: GotResponse<string> = await got(`https://www.douyin.com/user/${ userId }`, {
    responseType: 'text',
    headers: {
      'User-Agent': pcUserAgent,
      Cookie: cookie,
      Host: 'www.douyin.com',
      Referer: 'https://www.douyin.com/'
    },
    followRedirect: false
  });

  return res.body;
}

/**
 * 请求user的视频列表
 * @param { string } cookie: string
 * @param { VideoQuery } videoQuery: user id
 * @param { string } XBogus
 */
export async function requestAwemePost(cookie: string, videoQuery: VideoQuery, XBogus: string): Promise<AwemePostResponse> {
  const urlParam: URLSearchParams = new URLSearchParams({
    device_platform: 'webapp',
    aid: '6383',
    channel: 'channel_pc_web',
    sec_user_id: videoQuery.secUserId,
    max_cursor: `${ new Date().getTime() }`,
    locate_query: 'false',
    show_live_replay_strategy: '1',
    count: '10',
    publish_video_strategy_type: '2',
    pc_client_type: '1',
    version_code: '170400',
    version_name: '17.4.0',
    cookie_enabled: 'true',
    screen_width: '1440',
    screen_height: '900',
    browser_language: 'zh-CN',
    browser_platform: 'MacIntel',
    browser_name: 'Edge',
    browser_version: '109.0.1518.52',
    browser_online: 'true',
    engine_name: 'Blink',
    engine_version: '109.0.0.0',
    os_name: 'Mac+OS',
    os_version: '10.15.7',
    cpu_core_num: '4',
    device_memory: '8',
    platform: 'PC',
    downlink: '0.95',
    effective_type: '3g',
    round_trip_time: '650',
    webid: videoQuery.webId,
    msToken: `${ rStr(36) }-${ rStr(43) }-${ rStr(47) }`,
    'X-Bogus': XBogus
  });

  const res: GotResponse<AwemePostResponse> = await got.get(
    `https://www.douyin.com/aweme/v1/web/aweme/post/?${ urlParam.toString() }`, {
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