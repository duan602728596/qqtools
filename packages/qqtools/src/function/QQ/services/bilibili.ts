import type { BilibiliLiveStatus } from '../qq.types';

/* 获取直播间状态 */
export async function requestRoomStatus(id: string): Promise<BilibiliLiveStatus> {
  const res: Response = await fetch(`https://api.live.bilibili.com/room/v1/Room/room_init?id=${ id }`, {
    mode: 'no-cors'
  });

  return await res.json();
}