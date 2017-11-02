/**
 * 微打赏榜单计算
 */
import getData from './function/getData';
import { daka, juju } from './function/computingWds';

const listUrl: string = `https://wds.modian.com/ajax/backer_ranking_list`;

addEventListener('message', async function(event: Object): void{
  const { proId, type, size, title }: {
    proId: string,
    type: string,
    size: string,
    title: string
  } = event.data;
  const x: number = Number(size);
  const pageSize: number = isNaN(x) ? 10 ** 10 : x;
  const d: string = `pro_id=${ proId }&type=${ type }&page=1&page_size=${ pageSize }`;
  const data: Object = await getData('POST', listUrl, d);

  const text: string = type === '1' ? jujubang(data, title) : dakabang(data, title);
  postMessage({
    text
  });

}, false);

/* 计算聚聚榜 */
function jujubang(data: Object, title: string): string{
  let text: ?string = null;
  if(data.status === 0){
    const data2: Array = juju(data.data.html).arr;
    text = `【${ title }】\n聚聚榜，前${ data2.length }名。\n`;
    data2.map((item: Object, index: number): void=>{
      text += `\n${ index + 1 }、 ${ item.nickname } （￥${ String(item.money.toFixed(2)) }）`;
    });
  }else{
    text = '[ERROR] 获取微打赏聚聚榜错误。';
  }
  return text;
}

/* 计算打卡榜 */
function dakabang(data: Object, title: string): string{
  let text: ?string = null;
  if(data.status === 0){
    const data2: Array = daka(data.data.html);
    text = `【${ title }】\n打卡榜，前${ data2.length }名。\n`;
    data2.map((item: Object, index: number): void=>{
      text += `\n${ index + 1 }、${ item.nickname } （${ item.day }天）`;
    });
  }else{
      text = '[ERROR] 获取微打赏打卡榜错误。';
  }
  return text;
}