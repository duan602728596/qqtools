import type { WeiboContainerList } from '../qq.types';

/**
 * 获取微博列表
 * @param { string } lfid: 微博的lfid
 */
export async function requestWeiboContainer(lfid: string): Promise<WeiboContainerList> {
  const res: Response = await fetch(`https://m.weibo.cn/api/container/getIndex?containerid=${ lfid }`, {
    mode: 'no-cors'
  });

  return await res.json();
}