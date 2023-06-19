/* 抖音user */
interface AwemeItemRate {
  width: number;
  height: number;
  url_list: Array<string>;
}

export interface AwemeItem {
  desc: string;
  video: {
    bit_rate: Array<{
      play_addr: AwemeItemRate;
      download_addr?: AwemeItemRate;
    }>;
    cover: {
      url_list: Array<string>;
    };
  };
  aweme_id: string;
  create_time: number;
  author: {
    nickname: string;
  };
}

export interface AwemePostResponse {
  aweme_list: Array<AwemeItem>;
  max_cursor: number;
  has_more: 1 | 0;
}

/* 小红书 */
export interface PostedNoteItem {
  type: 'normal' | 'video';
  note_id: string;
  cover: {
    url: string;
  };
}

export interface UserPostedResponse {
  code: number;
  success: boolean;
  data: {
    cursor: string;
    has_more: boolean;
    notes: Array<PostedNoteItem>;
  };
}

export interface FeedNodeCard {
  time: number;
  title: string;
  type: 'normal' | 'video';
  user: {
    avatar: string;
    nickname: string;
  };
  video?: {
    media: {
      stream: {
        h264: [{
          master_url: string;
        }];
      };
    };
  };
}

export interface NoteFeedResponse {
  code: number;
  success: boolean;
  data: {
    items: [{
      id: string;
      model_type: 'note';
      note_card: FeedNodeCard;
    }];
  };
}

export interface SignResult {
  'X-s': string;
  'X-t': string;
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