import type { GiftMoneyItem, GiftMoney } from '../../../services/interface';

// 单条礼物信息
export interface GiftItem {
  giftId: number;
  giftName: string;
  giftNum: number;
  userId: number;
  nickName: string;
}

// 礼物的发送信息
export interface GiftSendItem {
  giftId: number;
  giftName: string;
  giftNum: number;
  money: number;
}

// 每个user的礼物信息
export interface GiftUserItem {
  userId: number;
  nickName: string;
  giftList: Array<GiftSendItem>;
  qingchunshikeGiftList: Array<GiftSendItem>;
  total: number;  // 鸡腿
  total2: number; // 青春时刻
}

/**
 * 计算礼物送的数量
 * @param { Array<GiftItem> } data: 送的礼物
 * @param { Array<GiftMoneyItem> } giftList: 礼物价格信息
 */
export function giftSend(data: Array<GiftItem>, giftList: Array<GiftMoneyItem>): Array<GiftSendItem> {
  const result: Array<GiftSendItem> = [];

  for (const item of data) {
    const g: GiftSendItem | undefined = result.find((o: GiftSendItem): boolean => o.giftName === item.giftName);

    if (g) {
      g.giftNum += item.giftNum;
    } else {
      result.push({
        giftId: item.giftId,
        giftName: item.giftName,
        giftNum: item.giftNum,
        money: giftList.find((o: GiftMoneyItem): boolean => o.giftId === item.giftId)?.money ?? 0
      });
    }
  }

  return result.sort((a: GiftSendItem, b: GiftSendItem): number => b.money - a.money);
}

/**
 * 计算每个人的礼物
 * @param { Array<GiftItem> } data: 送的礼物
 * @param { Array<GiftMoneyItem> } giftList: 礼物价格信息
 */
export function giftLeaderboard(data: Array<GiftItem>, giftList: Array<GiftMoneyItem>): Array<GiftUserItem> {
  const result: Array<GiftUserItem> = [];

  for (const item of data) {
    let user: GiftUserItem | undefined = result.find((o: GiftUserItem): boolean => o.userId === item.userId);

    if (!user) {
      result.push({
        userId: item.userId,
        nickName: item.nickName,
        giftList: [],
        qingchunshikeGiftList: [],
        total: 0,
        total2: 0
      });
      user = result[result.length - 1];
    }

    const isQingchunshikeGift: boolean = /^\d+(.\d+)?分$/.test(item.giftName);
    const g: GiftSendItem | undefined = user[isQingchunshikeGift ? 'qingchunshikeGiftList' : 'giftList'].find(
      (o: GiftSendItem): boolean => o.giftName === item.giftName);

    if (g) {
      g.giftNum += item.giftNum;
      user[isQingchunshikeGift ? 'total2' : 'total'] += item.giftNum * g.money;
    } else {
      user[isQingchunshikeGift ? 'qingchunshikeGiftList' : 'giftList'].push({
        giftId: item.giftId,
        giftName: item.giftName,
        giftNum: item.giftNum,
        money: giftList.find((o: GiftMoneyItem): boolean => o.giftId === item.giftId)?.money ?? 0
      });
    }
  }

  result.sort((a: GiftUserItem, b: GiftUserItem): number => (b.total2 + b.total) - (a.total2 + a.total));

  result.forEach((o: GiftUserItem): void => {
    if (o.qingchunshikeGiftList.length) {
      o.qingchunshikeGiftList.sort((a: GiftSendItem, b: GiftSendItem): number => b.money - a.money);
    }

    if (o.giftList.length) {
      o.giftList.sort((a: GiftSendItem, b: GiftSendItem): number => b.money - a.money);
    }
  });

  return result;
}