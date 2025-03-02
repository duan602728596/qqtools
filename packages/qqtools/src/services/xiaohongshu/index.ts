// @ts-expect-error
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

const userAgent: string = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Edg/126.0.0.0';

// 请求user数据: https://www.xiaohongshu.com/user/profile/656d18ba000000003d0379ee
export async function requestUserPosted(userId: string, cookie: string, signProtocol: XHSProtocol, port: number): Promise<UserPostedResponse> {
  const reqPath: string = `/api/sns/web/v1/user_posted?num=30&cursor=&user_id=${ userId }&image_formats=jpg,webp,avif`;
  const headers: SignResult = signProtocol === XHSProtocol.ChromeDevtoolsProtocol
    ? await invokeSign(reqPath, undefined)
    : await requestSign(port, reqPath, undefined);
  const res: GotResponse<UserPostedResponse> = await got.get(`https://edith.xiaohongshu.com${ reqPath }`, {
    responseType: 'json',
    headers: {
      origin: 'https://www.xiaohongshu.com',
      Referer: 'https://www.xiaohongshu.com/',
      Cookie: cookie,
      ...headers,
      'User-Agent': userAgent
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
  xsecToken: string,
  cookie: string,
  signProtocol: XHSProtocol,
  port: number,
  userId: string
): Promise<NoteFeedResponse> {
  const reqPath: string = '/api/sns/web/v1/feed';
  const json: Record<string, any> = {
    source_note_id: sourceNoteId,
    image_formats: ['jpg', 'webp', 'avif'],
    extra: { need_body_topic: 1 },
    xsec_source: 'pc_user',
    xsec_token: xsecToken
  };
  const headers: SignResult = signProtocol === XHSProtocol.ChromeDevtoolsProtocol
    ? await invokeSign(reqPath, JSON.stringify(json))
    : await requestSign(port, reqPath, json);
  const res: GotResponse<NoteFeedResponse> = await got.post(`https://edith.xiaohongshu.com${ reqPath }`, {
    responseType: 'json',
    headers: {
      origin: 'https://www.xiaohongshu.com',
      Referer: 'https://www.xiaohongshu.com/',
      Cookie: cookie,
      ...headers,
      'User-Agent': userAgent
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