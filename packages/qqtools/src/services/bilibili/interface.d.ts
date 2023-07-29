/* b站 */
interface BilibiliResponseBasic {
  code: number;
  message: string;
  ttl: number;
}

export interface BilibiliRoomInfo extends BilibiliResponseBasic {
  data: {
    anchor_info: {
      base_info: {
        uname: string;
      };
    };
  };
}

export interface BilibiliLiveStatus {
  code: number;
  message: string;
  msg: string;
  data: {
    live_status: number; // 1是直播
  };
}

// 空间动态
interface FeedSpaceModuleAuthor<A = string> {
  name: string;
  pub_action: A;
  pub_time: string;
  pub_ts: string; // 秒
}

interface FeedSpaceAVModuleDynamic {
  cover: string;
  jump_url: string;
  title: string;
}

interface FeedSpaceDrawModuleDynamic {
  desc: {
    text: string;
    major: {
      draw: {
        items: Array<{ src: string }>;
      };
    };
  };
}

export interface FeedSpaceDynamicTypeAV {
  type: 'DYNAMIC_TYPE_AV';
  modules: {
    module_author: FeedSpaceModuleAuthor;
    module_dynamic: FeedSpaceAVModuleDynamic;
  };
}

export interface FeedSpaceDynamicTypeDraw {
  type: 'DYNAMIC_TYPE_DRAW';
  modules: {
    module_author: FeedSpaceModuleAuthor<''>;
    module_dynamic: FeedSpaceDrawModuleDynamic;
  };
}

export type BilibiliFeedSpaceItem = FeedSpaceDynamicTypeAV | FeedSpaceDynamicTypeDraw;

export interface BilibiliFeedSpace extends BilibiliResponseBasic {
  data: {
    has_more: boolean;
    offset: string;
    items: Array<BilibiliFeedSpaceItem>;
  };
}