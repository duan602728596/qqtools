// @ts-expect-error
import got, { type Response as GotResponse } from 'got';
import { createHeaders } from '../../utils/snh48';
import * as biaoqingbao from './biaoqingbao.json' assert { type: 'json' };
import * as qingchunshike from './qingchunshike.json' assert { type: 'json' };
import type { GiftMoney, GiftMoneyGroup } from './interface';

export type * from './interface';

// 请求礼物列表
export async function requestGiftList(id: number): Promise<GiftMoney> {
  const res: GotResponse<GiftMoney> = await got.post('https://pocketapi.48.cn/gift/api/v1/gift/list', {
    responseType: 'json',
    headers: createHeaders(),
    json: {
      businessCode: 0,
      memberId: String(id)
    }
  });

  if (res.body?.content?.length) {
    if (!res.body.content.find((o: GiftMoneyGroup): boolean => o.typeId === biaoqingbao['default'].typeId)) {
      res.body.content.push(biaoqingbao['default']);
    }

    if (!res.body.content.find((o: GiftMoneyGroup): boolean => o.typeId === qingchunshike['default'].typeId)) {
      res.body.content.push(qingchunshike['default']);
    }
  }

  console.log(res.body);

  return res.body;
}