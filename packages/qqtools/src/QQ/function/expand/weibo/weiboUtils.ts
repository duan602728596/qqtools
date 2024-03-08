import * as dayjs from 'dayjs';
import type { WeiboCard, WeiboSendData, WeiboMBlog } from '@qqtools-api/weibo';

/**
 * 过滤微博信息
 * @param { Array<WeiboCard> } cards - 微博信息
 */
export function filterCards(cards: Array<WeiboCard>): Array<WeiboCard> {
  return cards
    // 过滤非发文微博
    .filter((o: WeiboCard): boolean => Number(o.card_type) === 9 && ('mblog' in o))
    .map((item: WeiboCard, index: number): WeiboCard => Object.assign(item, {
      _id: BigInt(item.mblog.id)
    }))
    .sort((a: WeiboCard, b: WeiboCard): number => a._id > b._id ? -1 : (a._id < b._id ? 1 : 0));
}

/**
 * 过滤新的微博
 * @param { Array<WeiboCard> } list - 过滤后的微博
 * @param { bigint } weiboId - 记录的微博id
 */
export function filterNewCards(list: Array<WeiboCard>, weiboId: bigint): Array<WeiboSendData> {
  return list.filter((o: WeiboCard) => BigInt(o.mblog.id) > weiboId)
    .map((item: WeiboCard, index: number): WeiboSendData => {
      const mblog: WeiboMBlog = item.mblog;

      return {
        id: BigInt(mblog.id),
        name: mblog.user.screen_name,
        type: 'retweeted_status' in item.mblog ? '转载' : '原创',
        scheme: item.scheme,
        time: dayjs(mblog.created_at).format('YYYY-MM-DD HH:mm:ss'),
        text: mblog.text.replace(/<[^<>]+>/g, ' '),
        pics: (mblog.pics ?? []).map((pic: { url: string }) => pic.url)
      };
    });
}