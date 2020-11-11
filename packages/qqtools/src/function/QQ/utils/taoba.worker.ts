import * as moment from 'moment';
import { requestIdolsJoin, requestDetail } from '../services/taoba';
import type { TaobaIdolsJoin, TaobaIdolsJoinItem, TaobaDetailDatasItem, TaobaDetail } from '../qq.types';

let taobaId: string;              // 桃叭ID
let timer: number | null = null;  // 轮询的定时器
let lastTime: number;             // 最后的集资时间
let taobaInfo: { title: string; amount: number; expire: number };
let otherTaobaIds: Array<string>; // 其他的桃叭ID

// 桃叭轮询函数
async function handleTaobaTimer(): Promise<void> {
  try {
    const result: Array<TaobaIdolsJoinItem> = [];
    let continue0: boolean = true;
    let page: number = 0;

    while (continue0) {
      const res: TaobaIdolsJoin = await requestIdolsJoin(taobaId, page);
      const list: Array<TaobaIdolsJoinItem> = res.list;
      const sendData: Array<TaobaIdolsJoinItem> = list.filter((o: TaobaIdolsJoinItem) => o.stime > lastTime);

      if (sendData.length > 0) {
        result.push(...sendData);
        page += 1;
      } else {
        continue0 = false;
      }
    }

    if (result.length > 0) {
      lastTime = result[0].stime; // 记录时间

      // 请求其他的桃叭信息
      let otherTaobaDetails: Array<TaobaDetailDatasItem> | undefined = undefined;

      if (otherTaobaIds?.length) {
        const queues: Array<Promise<TaobaDetail>> = otherTaobaIds.map((o: string): Promise<TaobaDetail> => requestDetail(o));
        const resData: Array<TaobaDetail> = await Promise.all(queues);

        otherTaobaDetails = resData.map((o: TaobaDetail): TaobaDetailDatasItem => o.datas);
      }

      // @ts-ignore
      postMessage({ result, otherTaobaDetails });
    }
  } catch (err) {
    console.error(err);
  }

  timer = self.setTimeout(handleTaobaTimer, 20_000);
}

/* 初始化 */
async function init(): Promise<void> {
  const res: TaobaIdolsJoin = await requestIdolsJoin(taobaId);

  lastTime = res.list.length > 0 ? res.list[0].stime : moment().unix();
  timer = self.setTimeout(handleTaobaTimer, 20_000);
}

addEventListener('message', function(event: MessageEvent): void {
  taobaId = event.data.taobaId;
  taobaInfo = event.data.taobaInfo;
  otherTaobaIds = event.data.otherTaobaIds;
  init();
}, false);