import got, { type Response as GotResponse } from 'got';
import type { _UserPostedObject, _FeedObject } from '@qqtools3/main/src/logProtocol/logTemplate/xiaohongshu.mjs';
import { _xiaohongshuLogProtocol } from '../../utils/logProtocol/logActions';
import { XHSProtocol, isSignMessage, type MessageObject } from '../../QQ/function/expand/xiaohongshu/xiaohongshu.worker/messageTypes';
import type { UserPostedResponse, NoteFeedResponse, SignResult } from './interface';

export type * from './interface';

export async function requestSign(port: number, reqPath: string, data: any | undefined): Promise<SignResult> {
  const res: Response = await fetch(`http://localhost:${ port }/xiaohongshu/sign`, {
    method: 'POST',
    body: JSON.stringify({
      url: reqPath,
      data
    })
  });

  return res.json();
}

function invokeSign(reqPath: string, data: string | undefined): Promise<SignResult> {
  const id: string = `${ Math.random() }`;

  return new Promise((resolve: Function, reject: Function): void => {
    function handleSignMessage(event: MessageEvent<MessageObject>): void {
      if (isSignMessage(event.data) && id === event.data.id) {
        removeEventListener('message', handleSignMessage);
        resolve(event.data.result);
      }
    }

    addEventListener('message', handleSignMessage);
    postMessage({ id, url: reqPath, data, type: 'sign' });
  });
}

// 请求user数据
export async function requestUserPosted(userId: string, cookie: string, signProtocol: XHSProtocol, port: number): Promise<UserPostedResponse> {
  const reqPath: string = `/api/sns/web/v1/user_posted?num=30&cursor=&user_id=${ userId }`;
  const headers: SignResult = signProtocol === XHSProtocol.ChromeDevtoolsProtocol
    ? await invokeSign(reqPath, undefined)
    : await requestSign(port, reqPath, undefined);
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
  signProtocol: XHSProtocol,
  port: number,
  userId: string
): Promise<NoteFeedResponse> {
  const reqPath: string = '/api/sns/web/v1/feed';
  const json: { source_note_id: string } = { source_note_id: sourceNoteId };
  const headers: SignResult = signProtocol === XHSProtocol.ChromeDevtoolsProtocol
    ? await invokeSign(reqPath, JSON.stringify(json))
    : await requestSign(port, reqPath, json);
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