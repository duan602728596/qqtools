import got, { Response as GotResponse } from 'got';
import { createHeaders } from '../../../utils/snh48';
import type { LoginInfo, IMUserInfo } from './interface';

/**
 * 账号登陆
 * @param { string } pwd
 * @param { string } mobile
 */
export async function requestPocketLogin(pwd: string, mobile: string): Promise<LoginInfo> {
  const res: GotResponse<LoginInfo> = await got.post('https://pocketapi.48.cn/user/api/v1/login/app/mobile', {
    responseType: 'json',
    headers: createHeaders(),
    timeout: 180_000,
    json: { pwd, mobile }
  });

  return res.body;
}

/**
 * 获取im信息
 * @param { string } token
 */
export async function requestImUserInfo(token: string): Promise<IMUserInfo> {
  const res: GotResponse<IMUserInfo> = await got.post('https://pocketapi.48.cn/im/api/v1/im/userinfo', {
    responseType: 'json',
    headers: createHeaders(token),
    timeout: 180_000,
    json: {}
  });

  return res.body;
}