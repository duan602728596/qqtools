// @ts-expect-error
import got, { type Response as GotResponse } from 'got';
import { randomString } from '../../utils/utils';
import type { WeiboInfo, WeiboContainerList } from './interface';

export type * from './interface';

const weiboCookieSubValue: string = randomString(89);
const userAgent: string = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36';

/**
 * 获取微博lfid
 * @param { string } uid - 微博uid
 */
export async function requestWeiboInfo(uid: string): Promise<WeiboInfo> {
  const res: GotResponse<WeiboInfo>
    = await got.get(`https://m.weibo.cn/api/container/getIndex?type=uid&value=${ uid }`, {
      responseType: 'json',
      headers: {
        Referer: `https://weibo.com/u/${ uid }`,
        'User-Agent': userAgent,
        Cookie: `SUB=_${ weiboCookieSubValue }`
      }
    });

  return res.body;
}

/**
 * 获取微博列表
 * 超话列表也用这个接口，containerid_-_sort_time可以按照发帖时间排序
 * @param { string } lfid - 微博的lfid
 */
export async function requestWeiboContainer<T = WeiboContainerList>(lfid: string): Promise<T> {
  const res: GotResponse<WeiboContainerList> = await got.get(`https://m.weibo.cn/api/container/getIndex?containerid=${ lfid }`, {
    responseType: 'json',
    headers: {
      Referer: 'https://weibo.com',
      'User-Agent': userAgent,
      Cookie: `SUB=_${ weiboCookieSubValue }`
    }
  });

  return res.body;
}