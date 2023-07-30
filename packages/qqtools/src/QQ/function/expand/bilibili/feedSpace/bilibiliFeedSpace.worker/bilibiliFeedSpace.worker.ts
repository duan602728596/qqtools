import { setTimeout } from 'node:timers';
import * as dayjs from 'dayjs';
import { requestFeedSpace, type BilibiliFeedSpace, type BilibiliFeedSpaceItem } from '@qqtools-api/bilibili';
import parser, { type ParserResult } from '../../../../parser';
import * as CQ from '../../../../parser/CQ';
import type { QQProtocol } from '../../../../../QQBotModals/ModalTypes';

let bilibiliFeedSpaceId: string; // bilibili空间id
let bilibiliFeedSpaceTimer: NodeJS.Timer | null = null;
let idStr: string | null = null; // 记录查询位置
let protocol: QQProtocol;        // 协议
let requestCookie: string;

/* 过滤最新的数据 */
function filterData(data: Array<BilibiliFeedSpaceItem>): Array<BilibiliFeedSpaceItem> {
  const nextData: Array<BilibiliFeedSpaceItem> = [];

  for (const item of data) {
    if (item.id_str !== idStr) {
      nextData.push(item);
    } else {
      break;
    }
  }

  return nextData;
}

/* 创建发送消息 */
function createSendMessageItem(item: BilibiliFeedSpaceItem): string {
  const time: string = dayjs(item.modules.module_author.pub_ts).format('YYYY-MM-DD HH:mm:ss');
  const sendMessageGroup: Array<string> = [];
  const action: string = item.type === 'DYNAMIC_TYPE_AV' ? '投稿了视频' : '发送了动态';
  let text: string;

  if (item.type === 'DYNAMIC_TYPE_AV') {
    text = item.modules.module_dynamic.major.archive.title;
  } else {
    text = item.modules.module_dynamic.desc.text;
  }

  sendMessageGroup.push(`${ item.modules.module_author.name } 在${ time }${ action }：${ text }`);

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
      if (idStr === null) {
        idStr = res.data.items[0].id_str;
      }

      const nextData: Array<BilibiliFeedSpaceItem> = filterData(res.data.items);

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
          idStr = nextData[0].id_str;
        }
      }
    }
  } catch (err) {
    console.error(err);
  }

  bilibiliFeedSpaceTimer = setTimeout(bilibiliFeedSpaceTimerFunc, 300_000);
}

async function bilibiliFeedSpaceInit(): Promise<void> {
  try {
    const res: BilibiliFeedSpace = await requestFeedSpace(bilibiliFeedSpaceId, requestCookie);

    if (res?.data?.items?.length) {
      idStr = res.data.items[0].id_str;
    }
  } catch (err) {
    console.error(err);
  }

  bilibiliFeedSpaceTimer = setTimeout(bilibiliFeedSpaceTimerFunc, 300_000);
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