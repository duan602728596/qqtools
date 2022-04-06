import * as oicq from 'oicq';
import { filterCards, filterNewCards } from '../weiboUtils';
import { atAll, image, plain } from '../miraiUtils';
import { requestWeiboContainer } from '../../services/weibo';
import type { MessageChain, WeiboSendData, WeiboCard, WeiboContainerList } from '../../qq.types';

let lfid: string;       // 账号的lfid
let weiboTimer: number; // 轮询定时器
let weiboAtAll: boolean | undefined; // 是否at全体成员
let weiboId: bigint;    // 记录查询位置
let protocol: string;   // 协议：mirai或者oicq

/**
 * mirai的消息
 * @param { WeiboSendData } item
 */
function miraiSendGroup(item: WeiboSendData): Array<MessageChain> {
  const sendGroup: Array<MessageChain> = [];

  if (weiboAtAll) {
    sendGroup.push(atAll());
  }

  sendGroup.push(
    plain(`${ item.name } 在${ item.time }发送了一条微博：${ item.text }
类型：${ item.type }
地址：${ item.scheme }`)
  );

  if (item.pics.length > 0) {
    sendGroup.push(image(item.pics[0]));
  }

  return sendGroup;
}

/**
 * oicq的消息
 * @param { WeiboSendData } item
 */
function oicqSendGroup(item: WeiboSendData): string {
  let sendText: string = '';

  if (weiboAtAll) {
    sendText += `${ oicq.cqcode.at('all' as any) } `;
  }

  sendText += `${ item.name } 在${ item.time }发送了一条微博：${ item.text }
类型：${ item.type }
地址：${ item.scheme }`;

  if (item.pics.length > 0) {
    sendText += oicq.cqcode.image(item.pics[0]);
  }

  return sendText;
}

/* 轮询 */
async function weiboContainerListTimer(): Promise<void> {
  try {
    const resWeiboList: WeiboContainerList = await requestWeiboContainer(lfid);
    const newList: Array<WeiboSendData> = filterNewCards(
      filterCards(resWeiboList.data.cards), weiboId); // 过滤新的微博

    if (newList.length > 0) {
      weiboId = newList[0].id;

      for (const item of newList) {
        postMessage({
          sendGroup: protocol === 'oicq' ? oicqSendGroup(item) : miraiSendGroup(item)
        });
      }
    }
  } catch (err) {
    console.error(err);
  }

  weiboTimer = self.setTimeout(weiboContainerListTimer, 45_000);
}

/* 初始化微博查询 */
async function weiboInit(): Promise<void> {
  const resWeiboList: WeiboContainerList = await requestWeiboContainer(lfid);
  const list: Array<WeiboCard> = filterCards(resWeiboList.data.cards);

  weiboId = list?.[0]?._id ?? BigInt(0);
  weiboTimer = self.setTimeout(weiboContainerListTimer, 45_000);
}

addEventListener('message', function(event: MessageEvent) {
  lfid = event.data.lfid;
  weiboAtAll = event.data.weiboAtAll;
  protocol = event.data.protocol;
  weiboInit();
});