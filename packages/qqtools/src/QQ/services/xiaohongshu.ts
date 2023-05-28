import got, { type Response as GotResponse } from 'got';
import type { _UserPostedObject, _FeedObject } from '@qqtools3/main/src/logProtocol/logTemplate/xiaohongshu';
import { sign, type SignResult } from '../sdk/xiaohongshu/XiaoHongShuNode';
import { _xiaohongshuLogProtocol } from '../../utils/logProtocol/logActions';
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

  _xiaohongshuLogProtocol.post<_UserPostedObject>('userPosted', {
    userId,
    response: JSON.stringify(res.body, null, 2)
  });

  return res.body;
}

// 请求feed
export async function requestFeed(
  sourceNoteId: string,
  cookie: string,
  executablePath: string,
  userId: string
): Promise<NoteFeedResponse> {
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

  _xiaohongshuLogProtocol.post<_FeedObject>('feed', {
    userId,
    sourceNoteId,
    response: JSON.stringify(res.body, null, 2)
  });

  return res.body;
}