import got from 'got';
import type { Response as GotResponse } from 'got';
import type {
  AuthResponse,
  MessageResponse,
  MessageChain,
  WeiboInfo,
  BilibiliRoomInfo
} from '../qq.types';

/**
 * 根据authKey获取session
 * @param { string } socketHost
 * @param { number } port: 端口号
 * @param { string } authKey: 配置的authKey
 */
export async function requestAuth(socketHost: string, port: number, authKey: string): Promise<AuthResponse> {
  const res: Response = await fetch(`http://${ socketHost }:${ port }/auth`, {
    mode: 'no-cors',
    method: 'POST',
    body: JSON.stringify({ authKey })
  });

  return await res.json();
}

/**
 * session认证
 * @param { number } qq: qq号
 * @param { string } socketHost
 * @param { number } port: 端口号
 * @param { string } session
 */
export async function requestVerify(qq: number, socketHost: string, port: number, session: string): Promise<MessageResponse> {
  const res: Response = await fetch(`http://${ socketHost }:${ port }/verify`, {
    mode: 'no-cors',
    method: 'POST',
    body: JSON.stringify({ qq, sessionKey: session })
  });

  return await res.json();
}

/**
 * 释放session
 * @param { number } qq: qq号
 * @param { string } socketHost
 * @param { number } port: 端口号
 * @param { string } session
 */
export async function requestRelease(qq: number, socketHost: string, port: number, session: string): Promise<MessageResponse> {
  const res: Response = await fetch(`http://${ socketHost }:${ port }/release`, {
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
 * @param { string } socketHost
 * @param { number } port: 端口号
 * @param { string } session
 * @param { Array<MessageChain> } messageChain: 发送信息
 */
export async function requestSendGroupMessage(
  groupNumber: number,
  socketHost: string,
  port: number,
  session: string,
  messageChain: Array<MessageChain>
): Promise<MessageResponse> {
  const res: Response = await fetch(`http://${ socketHost }:${ port }/sendGroupMessage`, {
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
 * 判断当前qq号是否登陆
 * @param { string } socketHost
 * @param { number } port: 端口号
 * @param { number } qqNumber: qq号
 */
export async function requestManagers(socketHost: string, port: number, qqNumber: number): Promise<MessageResponse | Array<any>> {
  const res: GotResponse<MessageResponse | Array<any>>
    = await got.get(`http://${ socketHost }:${ port }/managers?qq=${ qqNumber }`, {
      responseType: 'json',
      timeout: 3000
    });

  return res.body;
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

/* 获取B站直播间信息 */
export async function requestRoomInfo(id: string): Promise<BilibiliRoomInfo> {
  const res: GotResponse<BilibiliRoomInfo>
    = await got.get(`https://api.live.bilibili.com/xlive/web-room/v1/index/getInfoByRoom?room_id=${ id }`, {
      responseType: 'json',
      headers: {
        Referer: `https://live.bilibili.com/${ id }`
      }
    });

  return res.body;
}