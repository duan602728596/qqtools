import { encodeData, decodeData } from '../utils/taobaUtils';
import type { TaobaDetail, TaobaIdolsJoin, TaobaJoinRank } from '../qq.types';

/**
 * 请求详细数据
 * @param { string } id: 项目id
 */
export async function requestDetail(id: string): Promise<TaobaDetail> {
  const time: number = new Date().getTime();
  const data: string = await encodeData(`{"id":"${ id }","requestTime":${ time },"_version_":1,"pf":"h5"}`);
  const res: Response = await fetch('https://www.taoba.club/idols/detail', {
    mode: 'no-cors',
    method: 'POST',
    body: data
  });
  const resText: string = await res.text();
  const deData: string = await decodeData(resText);

  return JSON.parse(deData);
}

/**
 * 请求集资数据
 * @param { string } id: 项目id
 * @param { number } page: 分页
 */
export async function requestIdolsJoin(id: string, page: number = 0): Promise<TaobaIdolsJoin> {
  const time: number = new Date().getTime();
  const offset: number = page * 20;
  const data: string = await encodeData(`{"ismore":${ page === 0 ? 'true' : 'false' },"limit":20,`
    + `"id":"${ id }","offset":${ offset },"requestTime":${ time },"_version_":1,"pf":"h5"}`);
  const res: Response = await fetch('https://www.taoba.club/idols/join', {
    mode: 'no-cors',
    method: 'POST',
    body: data
  });
  const resText: string = await res.text();
  const deData: string = await decodeData(resText);

  return JSON.parse(deData);
}

/**
 * 获取集资人数
 * @param { string } id: 项目id
 */
export async function requestJoinRank(id: string): Promise<TaobaJoinRank> {
  const time: number = new Date().getTime();
  const data: string = await encodeData(`{"id":"${ id }","iscoopen":0,"requestTime":${ time },"_version_":1,"pf":"h5"}`);
  const res: Response = await fetch('https://www.taoba.club/idols/join/rank', {
    mode: 'no-cors',
    method: 'POST',
    body: data
  });

  const resText: string = await res.text();
  const deData: string = await decodeData(resText);

  return JSON.parse(deData);
}