export interface Pocket48ResponseBase {
  message: string;
  status: number;
  success: boolean;
}

/* 口袋礼物 */
export interface GiftMoneyItem {
  giftId: number;
  money: number;
  giftName: string;
}

export interface GiftMoneyGroup {
  typeId: number;
  typeName: string;
  specialInstru: string;
  giftList: Array<GiftMoneyItem>;
}

export interface GiftMoney {
  status: number;
  success: boolean;
  message: string;
  content: Array<GiftMoneyGroup>;
}