import { requestRoomStatus, type BilibiliLiveStatus } from '@qqtools-api/bilibili';

/* B站直播监听 */
let id: string; // 直播间id
let status: boolean | null = null; // 直播状态
let timer: number;

/* 轮询监听直播 */
async function getLiveStatusTimer(): Promise<void> {
  try {
    const res: BilibiliLiveStatus = await requestRoomStatus(id);

    if (res?.data?.live_status) {
      if (status === null) {
        status = res.data.live_status === 1;
      }

      const newStatus: boolean = res.data.live_status === 1;

      // 上次查询不在直播状态，但是这次直播在播放状态，说明开启了直播
      if (!status && newStatus) {
        postMessage({ type: 'bilibili' });
      }

      status = newStatus;
    }
  } catch (err) {
    console.error(err);
  }

  timer = self.setTimeout(getLiveStatusTimer, 45_000);
}

async function init(): Promise<void> {
  const res: BilibiliLiveStatus = await requestRoomStatus(id);

  if (res?.data?.live_status) {
    status = res.data.live_status === 1;
  }

  timer = self.setTimeout(getLiveStatusTimer, 45_000);
}

addEventListener('message', function(event: MessageEvent) {
  id = event.data.id;
  init();
}, false);