/* b站 */
export interface BilibiliRoomInfo {
  code: number;
  message: string;
  ttl: number;
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