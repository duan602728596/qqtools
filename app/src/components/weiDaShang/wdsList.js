/**
 * 微打赏榜单计算
 */
import getData from './function/getData';
import { daka, juju } from './function/computingWds';

const listUrl: string = `https://wds.modian.com/ajax/backer_ranking_list`;

addEventListener('message', async function(event: Event): void{
  const { proId, type, size, title }: {
    proId: string,
    type: string,
    size: string,
    title: string
  } = event.data;
  const pageSize: number = Number(size);

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

  const text: string = type === '1' ? jujubang(html, title, pageSize) : dakabang(html, title, pageSize);
  postMessage({
    text
  });

}, false);

/* 计算聚聚榜 */
function jujubang(html: string, title: string, len: number): string{
  let text: ?string = null;
  const data2: Array = juju(html).arr;
  const len2: number = data2.length < len ? data2.length : len;
  text = `【${ title }】\n聚聚榜，前${ len2 }名。\n`;
  for(let i: number = 0; i < len2; i++){
    const item: Object = data2[i];
    text += `\n${ i + 1 }、 ${ item.nickname } （￥${ String(item.money.toFixed(2)) }）`;
  }
  return text;
}

/* 计算打卡榜 */
function dakabang(html: string, title: string, len: number): string{
  let text: ?string = null;
  const data2: Array = daka(html);
  const len2: number = data2.length < len ? data2.length : len;
  text = `【${ title }】\n打卡榜，前${ len2 }名。\n`;
  for(let i: number = 0; i < len2; i++){
    const item: Object = data2[i];
    text += `\n${ i + 1 }、${ item.nickname } （${ item.day }天）`;
  }
  return text;
}