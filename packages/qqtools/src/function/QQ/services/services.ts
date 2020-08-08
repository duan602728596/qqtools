import got from 'got';
import type { Response as GotResponse } from 'got';
import type { AuthResponse, MessageResponse, MessageChain, WeiboInfo, WeiboContainerList } from '../qq.types';

/**
 * 根据authKey获取session
 * @param { number } port: 端口号
 * @param { string } authKey: 配置的authKey
 */
export async function requestAuth(port: number, authKey: string): Promise<AuthResponse> {
  const res: Response = await fetch(`http://localhost:${ port }/auth`, {
    mode: 'no-cors',
    method: 'POST',
    body: JSON.stringify({ authKey })
  });

  return await res.json();
}

/**
 * session认证
 * @param { number } qq: qq号
 * @param { number } port: 端口号
 * @param { string } session
 */
export async function requestVerify(qq: number, port: number, session: string): Promise<MessageResponse> {
  const res: Response = await fetch(`http://localhost:${ port }/verify`, {
    mode: 'no-cors',
    method: 'POST',
    body: JSON.stringify({ qq, sessionKey: session })
  });

  return await res.json();
}

/**
 * 释放session
 * @param { number } qq: qq号
 * @param { number } port: 端口号
 * @param { string } session
 */
export async function requestRelease(qq: number, port: number, session: string): Promise<MessageResponse> {
  const res: Response = await fetch(`http://localhost:${ port }/release`, {
    mode: 'no-cors',
    method: 'POST',
    body: JSON.stringify({ qq, sessionKey: session })
  });

  return await res.json();
}

/**
 * 发送群消息
 * 文字消息：{ type: 'Plain', text: '' }
 * 图片消息：{ type: 'Image', url: '' }
 * At: { type: 'At', target: 123456, display: 'name' }
 * AtAll: { type: 'AtAll', target: 0 }
 * @param { number } groupNumber: 群号
 * @param { number } port: 端口号
 * @param { string } session
 * @param { Array<MessageChain> } messageChain: 发送信息
 */
export async function requestSendGroupMessage(
  groupNumber: number,
  port: number,
  session: string,
  messageChain: Array<MessageChain>
): Promise<MessageResponse> {
  const res: Response = await fetch(`http://localhost:${ port }/sendGroupMessage`, {
    mode: 'no-cors',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    body: JSON.stringify({
      sessionKey: session,
      target: groupNumber,
      group: groupNumber,
      messageChain
    })
  });

  return await res.json();
}

/**
 * 获取微博lfid
 * @param { string } uid: 微博uid
 */
export async function requestWeiboInfo(uid: string): Promise<WeiboInfo> {
  const res: GotResponse<WeiboInfo>
    = await got.get(`https://m.weibo.cn/api/container/getIndex?type=uid&value=${ uid }`, {
      responseType: 'json'
    });

  return res.body;
}

/**
 * 获取微博列表
 * @param { string } lfid: 微博的lfid
 */
export async function requestWeiboContainer(lfid: string): Promise<WeiboContainerList> {
  const res: GotResponse<WeiboContainerList>
    = await got.get(`https://m.weibo.cn/api/container/getIndex?containerid=${ lfid }`, {
      responseType: 'json'
    });

  return res.body;
}