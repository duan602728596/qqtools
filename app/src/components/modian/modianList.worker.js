/**
 * 微打赏榜单计算
 */
import getData from './function/getData';
import sign from './function/signInWorker';

const dingDanUrl: string = 'https://wds.modian.com/api/project/sorted_orders';
const listUrl: string = 'https://wds.modian.com/api/project/rankings';

/* 计算聚聚榜 */
function jujubang(backList: Array, title: string, len: number): string {
  let text: ?string = null;
  const len2: number = backList.length < len ? backList.length : len;

  text = `【${ title }】\n聚聚榜，前${ len2 }名。\n`;

  for (let i: number = 0; i < len2; i++) {
    const item: Object = backList[i];

    text += `\n${ i + 1 }、 ${ item.nickname } （￥${ item.backer_money }）`;
  }

  return text;
}

/* 计算打卡榜 */
function dakabang(backList: Array, title: string, len: number): string {
  let text: ?string = null;
  const len2: number = backList.length < len ? backList.length : len;

  text = `【${ title }】\n打卡榜，前${ len2 }名。\n`;

  for (let i: number = 0; i < len2; i++) {
    const item: Object = backList[i];

    text += `\n${ i + 1 }、${ item.nickname } （${ item.support_days }天）`;
  }

  return text;
}

/* 计算订单榜 */
function dingdan(backList: Array, title: string, len: number): string {
  let text: ?string = null;
  const len2: number = backList.length < len ? backList.length : len;

  text = `【${ title }】\n订单，前${ len2 }个。\n`;

  for (let i: number = 0; i < len2; i++) {
    const item: Object = backList[i];

    text += `\n${ i + 1 }、${ item.pay_success_time }\n${ item.nickname } （￥${ item.backer_money }）`;
  }

  return text;
}

addEventListener('message', async function(event: Event): void {
  try {
    const { proId, type, size, title }: {
      proId: string;
      type: string;
      size: string;
      title: string;
    } = event.data;
    const pageSize: number = Number(size);

    let backList: Array = [];
    let text: ?string = null;
    const size2: number = Math.floor(pageSize / 20) + (pageSize % 20 === 0 ? 0 : 1);

    if (type === '订单') { // 查询订单
      for (let i: number = 1; i <= size2; i++) {
        const d: string = sign(`page=${ i }&pro_id=${ proId }&sort_by=1`);
        const res: Object = await getData('POST', dingDanUrl + '?t=' + new Date().getTime(), d);

        if (res.status !== '0' || res.data.length === 0) {
          break;
        } else {
          backList = backList.concat(res.data);
        }
      }
      text = dingdan(backList, title, pageSize);
    } else { // 查询榜单
      for (let i: number = 1; i <= size2; i++) {
        const d: string = sign(`page=${ i }&pro_id=${ proId }&type=${ type }`);
        const res: Object = await getData('POST', listUrl, d);

        if (res.status !== '0' || res.data.length === 0) {
          break;
        } else {
          backList = backList.concat(res.data);
        }
      }
      text = type === '1' ? jujubang(backList, title, pageSize) : dakabang(backList, title, pageSize);
    }
    postMessage({
      text
    });
  } catch (err) {
    console.error(err);
  }
}, false);