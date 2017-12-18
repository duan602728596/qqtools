/**
 * 微打赏榜单计算
 */
import MD5 from 'md5.js';
import getData from './function/getData';

const listUrl: string = `https://wds.modian.com/api/project/rankings`;

addEventListener('message', async function(event: Event): void{
  const { proId, type, size, title }: {
    proId: string,
    type: string,
    size: string,
    title: string
  } = event.data;
  const pageSize: number = Number(size);

  // 获取数据
  let backList: Array = [];
  for(let i: number = 1; i <= (Math.floor(pageSize / 20) + (pageSize % 20 === 0 ? 0 : 1)); i++){
    let d: string = `page=${ i }&pro_id=${ proId }&type=${ type }`;
    const signStr: string = new MD5().update(d + '&p=das41aq6').digest('hex');
    const sign: string = signStr.substr(5, 16);
    d += '&sign=' + sign;
    const res: Object = await getData('POST', listUrl, d);
    if(res.status !== '0'){
      break;
    }else{
      backList = backList.concat(res.data);
    }
  }

  const text: string = type === '1' ? jujubang(backList, title, pageSize) : dakabang(backList, title, pageSize);
  postMessage({
    text
  });

}, false);

/* 计算聚聚榜 */
function jujubang(backList: Array, title: string, len: number): string{
  let text: ?string = null;
  const len2: number = backList.length < len ? backList.length : len;
  text = `【${ title }】\n聚聚榜，前${ len2 }名。\n`;
  for(let i: number = 0; i < len2; i++){
    const item: Object = backList[i];
    text += `\n${ i + 1 }、 ${ item.nickname } （￥${ item.backer_money }）`;
  }
  return text;
}

/* 计算打卡榜 */
function dakabang(backList: Array, title: string, len: number): string{
  let text: ?string = null;
  const len2: number = backList.length < len ? backList.length : len;
  text = `【${ title }】\n打卡榜，前${ len2 }名。\n`;
  for(let i: number = 0; i < len2; i++){
    const item: Object = backList[i];
    text += `\n${ i + 1 }、${ item.nickname } （${ item.support_days }天）`;
  }
  return text;
}