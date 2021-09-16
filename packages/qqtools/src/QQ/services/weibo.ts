import type { WeiboContainerList } from '../qq.types';

/**
 * 获取微博列表
 * 超话列表也用这个接口，containerid_-_sort_time可以按照发帖时间排序
 * @param { string } lfid: 微博的lfid
 */
export async function requestWeiboContainer(lfid: string): Promise<WeiboContainerList> {
  const res: Response = await fetch(`https://m.weibo.cn/api/container/getIndex?containerid=${ lfid }`, {
    mode: 'no-cors'
  });

  return await res.json();
}