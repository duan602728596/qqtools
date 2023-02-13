import * as oicq from 'oicq';
import { filterCards, filterNewCards } from '../weiboUtils';
import { image, plain } from '../miraiUtils';
import { requestWeiboContainer } from '../../services/weibo';
import type {
  MessageChain,
  WeiboSendData,
  WeiboCard,
  WeiboSuperTopicContainerList,
  WeiboSuperTopicContainerCard
} from '../../qq.types';

let lfid: `${ string }_-_sort_time`; // 账号的lfid
let weiboTimer: number; // 轮询定时器
let weiboId: bigint;    // 记录查询位置
let superNick: string;  // 超话名称
let protocol: 'mirai' | 'oicq' | 'go-cqhttp'; // 协议：mirai或者oicq

/**
 * mirai的消息
 * @param { WeiboSendData } item
 */
function miraiSendGroup(item: WeiboSendData): Array<MessageChain> {
  const sendGroup: Array<MessageChain> = [];

  sendGroup.push(
    plain(`${ item.name } 在${ item.time }，在超话#${ superNick }#发送了一条微博：${ item.text }
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

  sendText += `${ item.name } 在${ item.time }，在超话#${ superNick }#发送了一条微博：${ item.text }
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
    const resWeiboList: WeiboSuperTopicContainerList = await requestWeiboContainer<WeiboSuperTopicContainerList>(lfid);
    const cardsGroup: Array<WeiboCard> = resWeiboList.data.cards
      .filter((o: WeiboSuperTopicContainerCard): boolean => Number(o.show_type) === 1)
      .map((o: WeiboSuperTopicContainerCard): Array<WeiboCard> => o.card_group)
      .flat();
    const newList: Array<WeiboSendData> = filterNewCards(filterCards(cardsGroup), weiboId); // 过滤新的微博

    if (newList.length > 0) {
      weiboId = newList[0].id;

      for (const item of newList) {
        postMessage({
          sendGroup: ['oicq', 'go-cqhttp'].includes(protocol) ? oicqSendGroup(item) : miraiSendGroup(item)
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
  const resWeiboList: WeiboSuperTopicContainerList = await requestWeiboContainer<WeiboSuperTopicContainerList>(lfid);
  const cardsGroup: Array<WeiboCard> = resWeiboList.data.cards
    .filter((o: WeiboSuperTopicContainerCard): boolean => Number(o.show_type) === 1)
    .map((o: WeiboSuperTopicContainerCard): Array<WeiboCard> => o.card_group)
    .flat();
  const list: Array<WeiboCard> = filterCards(cardsGroup);

  superNick = resWeiboList.data.pageInfo.nick;
  weiboId = list?.[0]?._id ?? BigInt(0);
  weiboTimer = self.setTimeout(weiboContainerListTimer, 45_000);
}

addEventListener('message', function(event: MessageEvent) {
  lfid = `${ event.data.lfid }_-_sort_time`;
  protocol = event.data.protocol;
  weiboInit();
});