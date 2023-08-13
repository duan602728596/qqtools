import { setTimeout } from 'node:timers';
import * as dayjs from 'dayjs';
import { requestFeedSpace, type BilibiliFeedSpace, type BilibiliFeedSpaceItem } from '@qqtools-api/bilibili';
import parser, { type ParserResult } from '../../../../parser';
import * as CQ from '../../../../parser/CQ';
import type { QQProtocol } from '../../../../../QQBotModals/ModalTypes';

let bilibiliFeedSpaceId: string; // bilibili空间id
let bilibiliFeedSpaceTimer: NodeJS.Timer | null = null;
let latestTime: number | null = null; // 记录最新的时间
let protocol: QQProtocol;             // 协议
let requestCookie: string;            // 请求cookie

/**
 * 格式化数据
 * @param { Array<BilibiliFeedSpaceItem> } data: 原始数据
 * @param { boolean } needFilter: 是否需要过滤
 */
function formatData(data: Array<BilibiliFeedSpaceItem>, needFilter?: boolean): Array<BilibiliFeedSpaceItem> {
  const nextData: Array<BilibiliFeedSpaceItem> = [...data].sort(
    (a: BilibiliFeedSpaceItem, b: BilibiliFeedSpaceItem): number =>
      b.modules.module_author.pub_ts - a.modules.module_author.pub_ts);

  if (needFilter) {
    return nextData.filter(
      (o: BilibiliFeedSpaceItem): boolean => latestTime !== null && o.modules.module_author.pub_ts > latestTime);
  }

  return nextData;
}

/* 创建发送消息 */
function createSendMessageItem(item: BilibiliFeedSpaceItem): string {
  const time: string = dayjs.unix(item.modules.module_author.pub_ts).format('YYYY-MM-DD HH:mm:ss');
  const sendMessageGroup: Array<string> = [];
  const action: string = item.type === 'DYNAMIC_TYPE_AV' ? '投稿了视频' : '发送了动态';
  let text: string;

  if (item.type === 'DYNAMIC_TYPE_AV') {
    text = item.modules.module_dynamic.major.archive.title;
  } else {
    text = item.modules.module_dynamic.desc.text;
  }

  sendMessageGroup.push(`${ item.modules.module_author.name } 在${ time }在B站${ action }：${ text }`);

  if (item.type === 'DYNAMIC_TYPE_AV') {
    sendMessageGroup.push(`\n地址：https:${ item.modules.module_dynamic.major.archive.jump_url }`);
  }

  if (item.type === 'DYNAMIC_TYPE_AV') {
    sendMessageGroup.push(`\n${ CQ.image(item.modules.module_dynamic.major.archive.cover) }`);
  } else if (item.modules.module_dynamic?.major?.draw?.items?.length) {
    sendMessageGroup.push(CQ.image(item.modules.module_dynamic.major.draw.items[0].src));
  }

  return sendMessageGroup.join('');
}

/* 轮询 */
async function bilibiliFeedSpaceTimerFunc(): Promise<void> {
  try {
    const res: BilibiliFeedSpace = await requestFeedSpace(bilibiliFeedSpaceId, requestCookie);

    if (res?.data?.items?.length) {
      if (latestTime === null) {
        latestTime = res.data.items[0].modules.module_author.pub_ts;
      }

      const nextData: Array<BilibiliFeedSpaceItem> = formatData(res.data.items, true);

      if (nextData.length) {
        const sendGroup: Array<ParserResult> = [];

        for (const item of nextData) {
          sendGroup.push(parser(createSendMessageItem(item), protocol));
        }

        if (sendGroup.length) {
          postMessage({
            type: 'message',
            sendGroup
          });
          latestTime = nextData[0].modules.module_author.pub_ts;
        }
      }
    }
  } catch (err) {
    console.error(err);
  }

  bilibiliFeedSpaceTimer = setTimeout(bilibiliFeedSpaceTimerFunc, 600_000);
}

async function bilibiliFeedSpaceInit(): Promise<void> {
  try {
    const res: BilibiliFeedSpace = await requestFeedSpace(bilibiliFeedSpaceId, requestCookie);

    if (res?.data?.items?.length) {
      const items: Array<BilibiliFeedSpaceItem> = formatData(res.data.items);

      latestTime = items[0].modules.module_author.pub_ts;
    }
  } catch (err) {
    console.error(err);
  }

  bilibiliFeedSpaceTimer = setTimeout(bilibiliFeedSpaceTimerFunc, 600_000);
}

addEventListener('message', function(event: MessageEvent<{
  bilibiliFeedSpaceId: string;
  protocol: QQProtocol;
  cookie: string;
}>): void {
  bilibiliFeedSpaceId = event.data.bilibiliFeedSpaceId;
  protocol = event.data.protocol;
  requestCookie = event.data.cookie;
  bilibiliFeedSpaceInit();
});