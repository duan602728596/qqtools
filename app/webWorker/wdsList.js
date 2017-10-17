/**
 * 微打赏榜单计算
 */

const listUrl = `https://wds.modian.com/ajax_backer_list`;

addEventListener('message', async function(event){
  const { proId, type, size, title } = event.data;
  const x = Number(size);
  const pageSize = isNaN(x) ? 10 ** 10 : x;
  const d = `pro_id=${ proId }&type=${ type }&page=1&pageSize=${ pageSize }`;
  const data = await getData('POST', listUrl, d);

  const text = type === '1' ? juju(data, title) : daka(data, title);
  postMessage({
    text
  });

}, false);

/* 计算聚聚榜 */
function juju(data, title){
  let text = null;
  if(data.status === '0'){
    text = `【${ title }】\n聚聚榜，前${ data.data.length }名。\n\n`;
    // nickname
    // total_back_amount
    data.data.map((item, index)=>{
      text += `\n${ index + 1 }、 ${ item.nickname } （￥${ String(item.total_back_amount.toFixed(2)) }）`;
    });
  }else{
    text = '[ERROR]获取微打赏聚聚榜错误。';
  }
  return text;
}

/* 计算打卡榜 */
function daka(data, title){
  let text = null;
  if(data.status === '0'){
    text = `【${ title }】\n打卡榜，前${ data.data.length }名。\n\n`;
    // nickname
    // total_back_days
    data.data.map((item, index)=>{
      text += `\n${ index + 1 }、${ item.nickname } （${ item.total_back_days }天）`;
    });
  }else{
      text = '[ERROR]获取微打赏打卡榜错误。';
  }
  return text;
}

/* ajax */
function getData(method, url, data){
  return new Promise((resolve, reject)=>{
    const xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.addEventListener('readystatechange', function(event){
      if(xhr.status === 200){
        try{
          const res = JSON.parse(xhr.response);
          resolve(res);
        }catch(err){
          // ！获取到的json虽然能够正常解析，但是会报格式错误，所以使用try来避免输出错误信息
        }
      }
    });
    xhr.send(data);
  });
}