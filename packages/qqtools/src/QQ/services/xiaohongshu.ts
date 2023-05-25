import got, { type Response as GotResponse } from 'got';
import type { UserPostedResponse, NoteFeedResponse } from './interface';

// 请求user数据
export async function requestUserPosted(userId: string, cookie: string, headers: Record<string, string>): Promise<UserPostedResponse> {
  const res: GotResponse<UserPostedResponse> = await got.get(
    `https://edith.xiaohongshu.com/api/sns/web/v1/user_posted?num=30&cursor=&user_id=${ userId }`, {
      responseType: 'json',
      headers: {
        origin: 'https://www.xiaohongshu.com',
        Referer: 'https://www.xiaohongshu.com/',
        Cookie: cookie,
        ...headers
      }
    });

  return res.body;
}

// 请求feed
export async function requestFeed(sourceNoteId: string, cookie: string, headers: Record<string, string>): Promise<NoteFeedResponse> {
  const res: GotResponse<NoteFeedResponse> = await got.post('https://edith.xiaohongshu.com/api/sns/web/v1/feed', {
    responseType: 'json',
    headers: {
      origin: 'https://www.xiaohongshu.com',
      Referer: 'https://www.xiaohongshu.com/',
      Cookie: cookie,
      ...headers
    },
    json: { source_note_id: sourceNoteId }
  });

  return res.body;
}