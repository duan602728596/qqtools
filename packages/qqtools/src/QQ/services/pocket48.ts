import got, { type Response as GotResponse } from 'got';
import { createHeaders } from '../../utils/snh48';
import type { GiftMoney } from './interface';

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

  return res.body;
}