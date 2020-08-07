import type { AuthResponse, VerifyResponse } from '../types';

/**
 * 根据authKey获取session
 * @param { number } port: 端口号
 * @param { string } authKey: 配置的authKey
 */
export async function requestAuth(port: number, authKey: string): Promise<AuthResponse> {
  const res: Response = await fetch(`http://localhost:${ port }/auth`, {
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
export async function requestVerify(qq: number, port: number, session: string): Promise<VerifyResponse> {
  const res: Response = await fetch(`http://localhost:${ port }/verify`, {
    method: 'POST',
    body: JSON.stringify({ qq, sessionKey: session })
  });

  return await res.json();
}

/**
 * 释放session
 * @param { int } qq: qq号
 * @param { int } port: 端口号
 * @param { string } session
 */
export async function requestRelease(qq: number, port: number, session: string): Promise<any> {
  const res: Response = await fetch(`http://localhost:${ port }/release`, {
    method: 'POST',
    body: JSON.stringify({ qq, sessionKey: session })
  });

  return await res.json();
}