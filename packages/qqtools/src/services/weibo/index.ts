import got, { type Response as GotResponse } from 'got';
import type { WeiboInfo, WeiboContainerList } from './interface';

export type * from './interface';

/**
 * 获取微博lfid
 * @param { string } uid: 微博uid
 */
export async function requestWeiboInfo(uid: string): Promise<WeiboInfo> {
  const res: GotResponse<WeiboInfo>
    = await got.get(`https://m.weibo.cn/api/container/getIndex?type=uid&value=${ uid }`, {
      responseType: 'json'
    });

  return res.body;
}

/**
 * 获取微博列表
 * 超话列表也用这个接口，containerid_-_sort_time可以按照发帖时间排序
 * @param { string } lfid: 微博的lfid
 */
export async function requestWeiboContainer<T = WeiboContainerList>(lfid: string): Promise<T> {
  const res: Response = await fetch(`https://m.weibo.cn/api/container/getIndex?containerid=${ lfid }`, {
    mode: 'no-cors'
  });

  return await res.json();
}