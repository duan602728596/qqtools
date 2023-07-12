import got, { type Response as GotResponse } from 'got';
import type { BilibiliLiveStatus, BilibiliRoomInfo } from './interface';

export type * from './interface';

/* 获取直播间状态 */
export async function requestRoomStatus(id: string): Promise<BilibiliLiveStatus> {
  const res: Response = await fetch(`https://api.live.bilibili.com/room/v1/Room/room_init?id=${ id }`, {
    mode: 'no-cors'
  });

  return await res.json();
}

/* 获取B站直播间信息 */
export async function requestRoomInfo(id: string): Promise<BilibiliRoomInfo> {
  const res: GotResponse<BilibiliRoomInfo>
    = await got.get(`https://api.live.bilibili.com/xlive/web-room/v1/index/getInfoByRoom?room_id=${ id }`, {
      responseType: 'json',
      headers: {
        Referer: `https://live.bilibili.com/${ id }`
      }
    });

  return res.body;
}