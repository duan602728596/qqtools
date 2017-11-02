/**
 * 微打赏轮询
 *
 * 排行榜
 * [POST] https://wds.modian.com/ajax/backer_ranking_list
 * pro_id  : 微打赏id
 * type    : 1 聚聚榜 2 打卡榜
 * page    : 页数
 * page_size: 每次请求的数据数
 */
import getData from './function/getData';
import { juju, changeMembers } from './function/computingWds';

const listUrl: string = `https://wds.modian.com/ajax/backer_ranking_list`;
let wdsId: ?string = null;
let moxiId: ?string = null;
let title: ?string = null;
let timer: ?number = null;     // 轮询定时器
let oldData: ?Array = null;    // 旧数据

// Object拷贝
function copyObj(obj: Object): Object{
  const newO: Object = {};
  for(const key: string in obj){
    newO[key] = obj[key];
  }
  return newO;
}

addEventListener('message', function(event: Object): boolean{
  const { data }: { data: Object } = event;
  // 初始化
  if(data.type === 'init'){
    wdsId = data.wdsId;
    moxiId = data.moxiId;
    title = data.title;

    // 初始化
    getData('POST', listUrl, `pro_id=${ wdsId }&type=1&page=1&page_size=10000000000`).then((result: Object)=>{
      // 获取旧排行榜
      if(result.status !== 0){
        oldData = {
          obj: {},
          arr: [],
          allMount: 0
        };
      }else{
        oldData = juju(result.data.html);
      }
      // 开启轮询
      timer = setInterval(polling, 5000);
    });
    return true;
  }
  // 关闭
  if(data.type === 'cancel'){
    if(timer){
      clearInterval(timer);
    }
    return true;
  }

}, false);

/* 轮询事件 */
async function polling(): void{
  const oldData23: Object =copyObj(oldData);
  try{
    const ct: Object = await getData('POST', listUrl, `pro_id=${ wdsId }&type=1&page=1&page_size=10000000000`);
    // 不等于0时报错
    if(ct.status === 0){
      const newD = juju(ct.data.html);
      if(newD.allMount !== oldData23.allMount){
        // 更新旧对比数据
        oldData = newD;
        const newData: Array = changeMembers(oldData23.obj, newD.arr, 0, newD.arr.length - 1);
        // 计算打赏金额和排名
        const jizi: Array = [];
        for(let i: Object = 0, j: Object = newData.length; i < j; i++){
          const item: Object = newData[i];
          const user_id: string = item.id;                                                                        // 当前用户的id
          const oldIndex: ?number = oldData23.obj[user_id] ? oldData23.obj[user_id].index : null;                 // 旧排名
          const newIndex: ?number = item.index;                                                                   // 新排名
          const promote: number = oldIndex !== null ? oldIndex - newIndex : newD.arr.length - newIndex;           // 排名提升
          const pay_amount: number = item.money - (user_id in oldData23.obj ? oldData23.obj[user_id].money : 0);  // 打赏金额
          jizi.push({
            user_id,
            pay_amount: String(pay_amount.toFixed(2)), // 打赏金额
            nickname: item.nickname,                   // 用户昵称
            newIndex,
            promote: promote < 0 ? 0 : promote,
            allMount: newD.allMount
          });
        }
        // 将数据发送回主线程
        postMessage({
          type: 'change',
          data: jizi
        });
      }
    }
  }catch(err){
    console.log(err);
  }
}