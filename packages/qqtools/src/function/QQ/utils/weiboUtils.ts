import { orderBy } from 'lodash';
import type { WeiboCard } from '../qq.types';

/**
 * 过滤微博信息
 * @param { Array<WeiboCard> } cards: 微博信息
 */
export function filterCards(cards: Array<WeiboCard>): Array<WeiboCard> {
  return orderBy<WeiboCard>(
    cards
      // 过滤非发文微博
      .filter((o: WeiboCard): boolean => {
        return o.card_type === 9 && 'mblog' in o;
      })
      .map((item: WeiboCard, index: number): WeiboCard => {
        return Object.assign(item, {
          _id: BigInt(item.mblog.id)
        });
      }),
    ['_id'], ['desc']);
}