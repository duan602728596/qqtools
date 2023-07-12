/* 微博类型 */
export interface WeiboTab {
  containerid: string;
  title: string;
  tabKey: string;
}

export interface WeiboInfo {
  ok: number;
  data: {
    tabsInfo: {
      tabs: Array<WeiboTab>;
    };
  };
}

export interface WeiboMBlog {
  id: string;
  user: {
    screen_name: string;     // 微博名
  };
  retweeted_status?: object; // 有为转载，没有为原创
  created_at: string;        // 发微博的时间
  text: string;              // 微博文字
  pics?: {
    url: string;             // 图片
  }[];
}

export interface WeiboCard {
  card_type: number;
  mblog: WeiboMBlog;
  scheme: string;
  _id: bigint;
}

export interface WeiboContainerList {
  ok: number;
  data: {
    cards: Array<WeiboCard>;
  };
}

// 微博超话
export interface WeiboSuperTopicContainerCard {
  show_type: '1'; // 帖子列表
  card_group: Array<WeiboCard>;
}

export interface WeiboSuperTopicContainerList {
  ok: number;
  data: {
    pageInfo: {
      nick: string;
      page_title: string;
    };
    cards: Array<WeiboSuperTopicContainerCard>;
  };
}

export interface WeiboSendData {
  id: bigint;
  name: string;
  type: string;
  scheme: string;
  time: string;
  text: string;
  pics: Array<string>;
}