// @flow
/**
 * 微打赏榜单计算
 */
import getData from './function/getData';

const listUrl: string = `https://wds.modian.com/ajax_backer_list`;

addEventListener('message', async function(event: Object): void{
  const { proId, type, size, title }: {
    proId: string,
    type: string,
    size: string,
    title: string
  } = event.data;
  const x: number = Number(size);
  const pageSize: number = isNaN(x) ? 10 ** 10 : x;
  const d: string = `pro_id=${ proId }&type=${ type }&page=1&pageSize=${ pageSize }`;
  const data: Object = await getData('POST', listUrl, d);

  const text: string = type === '1' ? juju(data, title) : daka(data, title);
  postMessage({
    text
  });

}, false);

/* 计算聚聚榜 */
function juju(data: Object, title: string): string{
  let text: ?string = null;
  if(data.status === '0'){
    text = `【${ title }】\n聚聚榜，前${ data.data.length }名。\n`;
    // nickname
    // total_back_amount
    data.data.map((item: Object, index: number): void=>{
      text += `\n${ index + 1 }、 ${ item.nickname } （￥${ String(item.total_back_amount.toFixed(2)) }）`;
    });
  }else{
    text = '[ERROR] 获取微打赏聚聚榜错误。';
  }
  return text;
}

/* 计算打卡榜 */
function daka(data: Object, title: string): string{
  let text: ?string = null;
  if(data.status === '0'){
    text = `【${ title }】\n打卡榜，前${ data.data.length }名。\n`;
    // nickname
    // total_back_days
    data.data.map((item: Object, index: number): void=>{
      text += `\n${ index + 1 }、${ item.nickname } （${ item.total_back_days }天）`;
    });
  }else{
      text = '[ERROR] 获取微打赏打卡榜错误。';
  }
  return text;
}