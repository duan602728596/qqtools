import {
  requestWeiboContainer,
  type WeiboSendData,
  type WeiboCard,
  type WeiboSuperTopicContainerList,
  type WeiboSuperTopicContainerCard
} from '@qqtools-api/weibo';
import { QQProtocol } from '../../../../QQBotModals/ModalTypes';
import { filterCards, filterNewCards } from '../weiboUtils';
import * as CQ from '../../../parser/CQ';

let lfid: `${ string }_-_sort_time`; // 账号的lfid
let weiboTimer: number; // 轮询定时器
let weiboId: bigint | null = null; // 记录查询位置
let superNick: string;  // 超话名称
let protocol: QQProtocol; // 协议：mirai或者oicq
let port: number; // 端口号

/**
 * @param { WeiboSendData } item
 */
function QQSendGroup(item: WeiboSendData): string {
  let sendText: string = '';

  sendText += `${ item.name } 在${ item.time }，在超话#${ superNick }#发送了一条微博：${ item.text }
类型：${ item.type }
地址：${ item.scheme }`;

  if (item.pics.length > 0) {
    sendText += CQ.image(
      protocol === QQProtocol.Mirai
        ? item.pics[0]
        : `http://localhost:${ port }/proxy/weibo/image?url=${ encodeURIComponent(item.pics[0]) }`
    );
  }

  return sendText;
}

/* 轮询 */
async function weiboContainerListTimer(): Promise<void> {
  try {
    const resWeiboList: WeiboSuperTopicContainerList = await requestWeiboContainer<WeiboSuperTopicContainerList>(lfid);

    if (resWeiboList?.data?.cards) {
      const cardsGroup: Array<WeiboCard> = resWeiboList.data.cards
        .filter((o: WeiboSuperTopicContainerCard): boolean => Number(o.show_type) === 1)
        .map((o: WeiboSuperTopicContainerCard): Array<WeiboCard> => o.card_group)
        .flat();
      const list: Array<WeiboCard> = filterCards(cardsGroup);

      if (weiboId === null) {
        superNick = resWeiboList?.data?.pageInfo?.nick;
        weiboId = list?.[0]?._id ?? BigInt(0);
      }

      const newList: Array<WeiboSendData> = filterNewCards(list, weiboId); // 过滤新的微博

      if (newList.length > 0) {
        weiboId = newList[0].id;

        for (const item of newList) {
          postMessage({
            sendGroup: QQSendGroup(item)
          });
        }
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

  if (resWeiboList?.data?.cards) {
    const cardsGroup: Array<WeiboCard> = resWeiboList.data.cards
      .filter((o: WeiboSuperTopicContainerCard): boolean => Number(o.show_type) === 1)
      .map((o: WeiboSuperTopicContainerCard): Array<WeiboCard> => o.card_group)
      .flat();
    const list: Array<WeiboCard> = filterCards(cardsGroup);

    superNick = resWeiboList.data.pageInfo.nick;
    weiboId = list?.[0]?._id ?? BigInt(0);
  }

  weiboTimer = self.setTimeout(weiboContainerListTimer, 45_000);
}

addEventListener('message', function(event: MessageEvent) {
  lfid = `${ event.data.lfid }_-_sort_time`;
  protocol = event.data.protocol;
  port = event.data.port;
  weiboInit();
});