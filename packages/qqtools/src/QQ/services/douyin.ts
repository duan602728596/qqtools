import got, { type Response as GotResponse } from 'got';
import Signer from '../sdk/Signer';
import { msToken } from '../function/expand/douyin/signUtils';
import type { AwemePostResponse } from './interface';

/**
 * 该方法运行在worker线程中，所以需要和其他依赖隔离
 */

const pcUserAgent: string = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  + ' (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36 Edg/110.0.1587.69';

/* 请求ttwid */
export async function requestTtwidCookie(): Promise<string | undefined> {
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

  return res.headers?.['set-cookie']?.[0];
}

interface VideoQuery {
  secUserId: string;
  webId: string;
}

/**
 * 请求user的视频列表
 * @param { string } cookie: string
 * @param { VideoQuery } videoQuery: user id
 */
export async function requestAwemePost(cookie: string, videoQuery: VideoQuery): Promise<AwemePostResponse | string> {
  const token: string = msToken();
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
    browser_version: '110.0.1587.69',
    browser_online: 'true',
    engine_name: 'Blink',
    engine_version: '110.0.0.0',
    os_name: 'Mac+OS',
    os_version: '10.15.7',
    cpu_core_num: '4',
    device_memory: '8',
    platform: 'PC',
    downlink: '3.6',
    effective_type: '4g',
    round_trip_time: '100',
    webid: '123456778',
    msToken: token
  });
  const xbogus: string = Signer.sign(urlParam.toString(), pcUserAgent);

  urlParam.set('X-Bogus', xbogus);

  const res: GotResponse<AwemePostResponse | string> = await got.get(
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