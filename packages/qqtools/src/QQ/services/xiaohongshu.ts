import got, { type Response as GotResponse } from 'got';
import { sign, type SignResult } from '../sdk/xiaohongshu/XiaoHongShuNode';
import type { UserPostedResponse, NoteFeedResponse } from './interface';

// 请求user数据
export async function requestUserPosted(userId: string, cookie: string, executablePath: string): Promise<UserPostedResponse> {
  const reqPath: string = `/api/sns/web/v1/user_posted?num=30&cursor=&user_id=${ userId }`;
  const headers: SignResult = await sign(executablePath, reqPath, undefined, cookie);
  const res: GotResponse<UserPostedResponse> = await got.get(`https://edith.xiaohongshu.com${ reqPath }`, {
    responseType: 'json',
    headers: {
      origin: 'https://www.xiaohongshu.com',
      Referer: 'https://www.xiaohongshu.com/',
      Cookie: cookie,
      ...headers
    }
  });

  if (process.env.NODE_ENV === 'development') {
    console.log('小红书 user_posted', res.body);
  }

  return res.body;
}

// 请求feed
export async function requestFeed(sourceNoteId: string, cookie: string, executablePath: string): Promise<NoteFeedResponse> {
  const reqPath: string = '/api/sns/web/v1/feed';
  const json: { source_note_id: string } = { source_note_id: sourceNoteId };
  const headers: SignResult = await sign(executablePath, reqPath, json, cookie);
  const res: GotResponse<NoteFeedResponse> = await got.post(`https://edith.xiaohongshu.com${ reqPath }`, {
    responseType: 'json',
    headers: {
      origin: 'https://www.xiaohongshu.com',
      Referer: 'https://www.xiaohongshu.com/',
      Cookie: cookie,
      ...headers
    },
    json
  });

  if (process.env.NODE_ENV === 'development') {
    console.log('小红书 feed', res.body);
  }

  return res.body;
}