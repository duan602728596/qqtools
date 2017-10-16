/**
 * 微打赏轮训
 *
 * 评论榜
 * [POST]https://wds.modian.com/ajax_comment
 * pageNum
 * moxi_id
 * pro_id
 * response:
 *   reply_fuid 用户id
 *   pay_amount 当前打卡数
 *   ctime      时间戳
 *   nickname   用户的昵称
 *
 * 排行榜
 * [POST] https://wds.modian.com/ajax_backer_list
 * pro_id  : 微打赏id
 * type    : 1 聚聚榜 2 打卡榜
 * page    : 页数
 * pageSize: 每次请求的数据数
 * response:
 *   user_id           用户id
 *   total_back_amount 总打卡数
 */

const listUrl = `https://wds.modian.com/ajax_backer_list`;
const commentUrl= `https://wds.modian.com/ajax_comment`;
let wdsId = null;
let moxiId = null;
let title = null;
let timer = null;      // 轮询定时器
let oldData = null;    // 旧数据
let oldComment = null; // 旧评论榜

addEventListener('message', function(event){
  const { data } = event;
  // 初始化
  if(data.type === 'init'){
    wdsId = data.wdsId;
    moxiId = data.moxiId;
    title = data.title;

    // 初始化
    Promise.all([
      getData('POST', listUrl, `pro_id=${ wdsId }&type=${ 1 }&page=${ 1 }&pageSize=10000000000`),
      getData('POST', commentUrl, `pageNum=1&moxi_id=${ moxiId }&pro_id=${ wdsId }`)
    ]).then((result)=>{
      const [data1, data2] = result;

      if(data1.status === '-1'){
        oldData = [];
      }else{
        oldData = data1.data;
      }

      if(data2.status === '-1'){
        oldComment = [];
      }else{
        oldComment = data2.des;
      }

      polling();
    });
    return true;
  }
  // 关闭
  if(data.type === 'cancel'){
    if(timer){
      clearTimeout(timer);
    }
    return true;
  }

}, false);

/* 轮询事件 */
async function polling(){
  try{
    const ct = await getData('POST', commentUrl, `pageNum=1&moxi_id=${ moxiId }&pro_id=${ wdsId }`);
    // 等于-1时报错
    if(ct.status !== '-1'){
      const { des } = ct;
      let newData = [];
      if(oldData.length === 0){
        // 无旧数据
        newData = des;
      }else{
        // 有旧数据时，对比时间戳
        for(let i = 0, j = des.length; i < j; i++){
          if(des[i].ctime !== oldComment[0].ctime && des[i].pay_amount !== ''){
            newData.push(des[i]);
          }else{
            break;
          }
        }
      }
      // 计算打赏金额和排名，newData为0时集资不变
      if(newData.length > 0){
        // 获取新排名
        const bl = await getData('POST', listUrl, `pro_id=${ wdsId }&type=${ 1 }&page=${ 1 }&pageSize=10000000000`);
        const len1 = bl.data.length - 1;
        const amt = String((allMount(bl.data, 0, len1)).toFixed(2));  // 总集资
        const jizi = [];
        for(let i = 0, j = newData.length; i < j; i++){
          const item = newData[i];
          const user_id = item.reply_fuid;
          const oldIndex = indexOf(oldData, user_id, 0, oldData.length - 1);
          const newIndex = indexOf(bl.data, user_id, 0, len1);
          const promote = newIndex - (oldIndex ? oldIndex : 0);
          jizi.push({
            user_id,
            pay_amount: item.pay_amount,
            nickname: item.c_userinfo.nickname,
            newIndex,
            promote: promote < 0 ? 0 : promote,
            allMount: amt
          });
        }

        oldData = bl.data;
        oldComment = ct.des;
        postMessage({
          type: 'change',
          data: jizi
        });
      }
    }
  }catch(err){
    console.log(err);
  }
  timer = setTimeout(polling, 4500);
}

/* 计算总集资数 */
function allMount(rawArray, from, to){
  if(rawArray.length === 0){
    return 0;
  }

  // from === to时，返回获取到的集资数
  if(from === to){
    return Number(rawArray[from]['total_back_amount']);
  }

  // 拆分计算
  const middle = Math.floor((to - from) / 2) + from;
  const left = allMount(rawArray, from, middle);
  const right = allMount(rawArray, middle + 1, to);

  return left + right;
}

/* 查找索引，没有则返回null */
function indexOf(rawArray, value, from, to){
  if(rawArray.length === 0){
    return null;
  }

  // from === to时，判断是否匹配
  if(from === to){
    if(rawArray[from].user_id === value){
      return from;
    }else{
      return null;
    }
  }

  // 拆分计算
  const middle = Math.floor((to - from) / 2) + from;
  const left = indexOf(rawArray, value, from, middle);
  if(left !== null){
    return left;
  }
  const right =indexOf(rawArray, value, middle + 1, to);
  if(right !== null){
    return right;
  }
  return null;
}

/* ajax */
function getData(method, url, data){
  return new Promise((resolve, reject)=>{
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.addEventListener('readystatechange', function(event){
      if(xhr.status === 200){
        try{
          const res = JSON.parse(xhr.response);
          resolve(res);
        }catch(err){
          // 捕获错误
        }
      }
    });
    xhr.send(data);
  });
}