import { filterCards, filterNewCards } from './weiboUtils';
import { image, plain } from './miraiUtils';
import { requestWeiboContainer } from '../services/weibo';
import type {
  MessageChain,
  WeiboSendData,
  WeiboCard,
  WeiboSuperTopicContainerList,
  WeiboSuperTopicContainerCard
} from '../qq.types';

let lfid: `${ string }_-_sort_time`; // 账号的lfid
let weiboTimer: number; // 轮询定时器
let weiboId: bigint;    // 记录查询位置
let superNick: string;  // 超话名称

/* 轮询 */
async function weiboContainerListTimer(): Promise<void> {
  try {
    const resWeiboList: WeiboSuperTopicContainerList = await requestWeiboContainer<WeiboSuperTopicContainerList>(lfid);
    const cardsGroupItem: WeiboSuperTopicContainerCard | undefined
      = resWeiboList.data.cards.find((o: WeiboSuperTopicContainerCard) => o.show_type === '1');
    const newList: Array<WeiboSendData> = filterNewCards(
      filterCards(cardsGroupItem?.card_group ?? []), weiboId); // 过滤新的微博

    if (newList.length > 0) {
      weiboId = newList[0].id;

      for (const item of newList) {
        const sendGroup: Array<MessageChain> = [];

        sendGroup.push(
          plain(`${ item.name } 在${ item.time }，在超话#${ superNick }#发送了一条微博：${ item.text }
类型：${ item.type }
地址：${ item.scheme }`)
        );

        if (item.pics.length > 0) {
          sendGroup.push(image(item.pics[0]));
        }

        // @ts-ignore
        postMessage({ sendGroup });
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
  const cardsGroupItem: WeiboSuperTopicContainerCard | undefined
    = resWeiboList.data.cards.find((o: WeiboSuperTopicContainerCard) => o.show_type === '1');
  const list: Array<WeiboCard> = filterCards(cardsGroupItem?.card_group ?? []);

  superNick = resWeiboList.data.pageInfo.nick;
  weiboId = list?.[0]._id ?? BigInt(0);
  weiboTimer = self.setTimeout(weiboContainerListTimer, 45_000);
}

addEventListener('message', function(event: MessageEvent) {
  lfid = `${ event.data.lfid }_-_sort_time`;
  weiboInit();
});