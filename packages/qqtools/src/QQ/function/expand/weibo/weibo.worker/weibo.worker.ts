import { QQProtocol } from '../../../../QQBotModals/ModalTypes';
import { filterCards, filterNewCards } from '../weiboUtils';
import { requestWeiboContainer } from '../../../../services/weibo';
import parser from '../../../parser';
import * as CQ from '../../../parser/CQ';
import type { WeiboCard, WeiboContainerList, WeiboSendData } from '../../../../qq.types';

let lfid: string;       // 账号的lfid
let weiboTimer: number; // 轮询定时器
let weiboAtAll: boolean | undefined; // 是否at全体成员
let weiboId: bigint | null = null;   // 记录查询位置
let protocol: QQProtocol; // 协议：mirai或者oicq
let port: number; // 端口号

/**
 * @param { WeiboSendData } item
 */
function QQSendGroup(item: WeiboSendData): string {
  let sendText: string = '';

  if (weiboAtAll) {
    sendText += CQ.atAll();
  }

  sendText += `${ item.name } 在${ item.time }发送了一条微博：${ item.text }
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
    const resWeiboList: WeiboContainerList = await requestWeiboContainer(lfid);

    if (resWeiboList?.data?.cards) {
      const list: Array<WeiboCard> = filterCards(resWeiboList.data.cards);

      if (weiboId === null) {
        weiboId = list?.[0]?._id ?? BigInt(0);
      }

      const newList: Array<WeiboSendData> = filterNewCards(list, weiboId); // 过滤新的微博

      if (newList.length > 0) {
        weiboId = newList[0].id;

        for (const item of newList) {
          postMessage({
            sendGroup: parser(QQSendGroup(item), protocol)
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
  const resWeiboList: WeiboContainerList = await requestWeiboContainer(lfid);

  if (resWeiboList?.data?.cards) {
    const list: Array<WeiboCard> = filterCards(resWeiboList.data.cards);

    weiboId = list?.[0]?._id ?? BigInt(0);
  }

  weiboTimer = self.setTimeout(weiboContainerListTimer, 45_000);
}

addEventListener('message', function(event: MessageEvent) {
  lfid = event.data.lfid;
  weiboAtAll = event.data.weiboAtAll;
  protocol = event.data.protocol;
  port = event.data.port;
  weiboInit();
});