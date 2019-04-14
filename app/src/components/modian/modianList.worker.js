/**
 * 微打赏榜单计算
 */
import getData from './function/getData';
import sign from './function/signInWorker';

const dingDanUrl = 'https://wds.modian.com/api/project/sorted_orders';
const listUrl = 'https://wds.modian.com/api/project/rankings';

/* 计算聚聚榜 */
function jujubang(backList, title, len) {
  let text = null;
  const len2 = backList.length < len ? backList.length : len;

  text = `【${ title }】\n聚聚榜，前${ len2 }名。\n`;

  for (let i = 0; i < len2; i++) {
    const item = backList[i];

    text += `\n${ i + 1 }、 ${ item.nickname } （￥${ item.backer_money }）`;
  }

  return text;
}

/* 计算打卡榜 */
function dakabang(backList, title, len) {
  let text = null;
  const len2 = backList.length < len ? backList.length : len;

  text = `【${ title }】\n打卡榜，前${ len2 }名。\n`;

  for (let i = 0; i < len2; i++) {
    const item = backList[i];

    text += `\n${ i + 1 }、${ item.nickname } （${ item.support_days }天）`;
  }

  return text;
}

/* 计算订单榜 */
function dingdan(backList, title, len) {
  let text = null;
  const len2 = backList.length < len ? backList.length : len;

  text = `【${ title }】\n订单，前${ len2 }个。\n`;

  for (let i = 0; i < len2; i++) {
    const item = backList[i];

    text += `\n${ i + 1 }、${ item.pay_success_time }\n${ item.nickname } （￥${ item.backer_money }）`;
  }

  return text;
}

addEventListener('message', async function(event) {
  try {
    const { proId, type, size, title } = event.data;
    const pageSize = Number(size);

    let backList = [];
    let text = null;
    const size2 = Math.floor(pageSize / 20) + (pageSize % 20 === 0 ? 0 : 1);

    if (type === '订单') { // 查询订单
      for (let i = 1; i <= size2; i++) {
        const d = sign(`page=${ i }&pro_id=${ proId }&sort_by=1`);
        const res = await getData('POST', dingDanUrl + '?t=' + new Date().getTime(), d);

        if (res.status !== '0' || res.data.length === 0) {
          break;
        } else {
          backList = backList.concat(res.data);
        }
      }
      text = dingdan(backList, title, pageSize);
    } else { // 查询榜单
      for (let i = 1; i <= size2; i++) {
        const d = sign(`page=${ i }&pro_id=${ proId }&type=${ type }`);
        const res = await getData('POST', listUrl, d);

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