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
  'X-S': string;
  'X-T': string;
  'X-S-Common': string;
}