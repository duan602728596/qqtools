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
  const pageSize: number = isNaN(x) ? 20 : x;

  let html: string = '';
  for(let i: number = 1; i <= (Math.floor(pageSize / 20) + (pageSize % 20 === 0 ? 0 : 1)); i++){
    const d: string = `pro_id=${ proId }&type=${ type }&page=${ i }&page_size=20`;
    const data: Object = await getData('POST', listUrl, d);
    if(data.status !== 0){
      break;
    }else{
      html += data.data.html;
    }
  }

  const text: string = type === '1' ? jujubang(html, title) : dakabang(html, title);
  postMessage({
    text
  });

}, false);

/* 计算聚聚榜 */
function jujubang(html: string, title: string): string{
  let text: ?string = null;
  const data2: Array = juju(html).arr;
  text = `【${ title }】\n聚聚榜，前${ data2.length }名。\n`;
  data2.map((item: Object, index: number): void=>{
    text += `\n${ index + 1 }、 ${ item.nickname } （￥${ String(item.money.toFixed(2)) }）`;
  });
  return text;
}

/* 计算打卡榜 */
function dakabang(html: string, title: string): string{
  let text: ?string = null;
  const data2: Array = daka(html);
  text = `【${ title }】\n打卡榜，前${ data2.length }名。\n`;
  data2.map((item: Object, index: number): void=>{
    text += `\n${ index + 1 }、${ item.nickname } （${ item.day }天）`;
  });
  return text;
}