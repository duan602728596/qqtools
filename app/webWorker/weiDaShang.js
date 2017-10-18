// @flow
/**
 * 微打赏轮询
 *
 * 评论榜
 * [POST]https://wds.modian.com/ajax_comment
 * pageNum
 * moxi_id
 * pro_id
 * response:
 *   reply_fuid   用户id
 *   pay_amount   当前打卡数
 *   ctime        时间戳
 *   c_userinfo
 *     nickname   用户的昵称
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
import getData from './function/getData';

const listUrl: string = `https://wds.modian.com/ajax_backer_list`;
const commentUrl: string = `https://wds.modian.com/ajax_comment`;
let wdsId: ?string = null;
let moxiId: ?string = null;
let title: ?string = null;
let timer: ?number = null;     // 轮询定时器
let oldData: ?Array = null;    // 旧数据
let oldComment: ?Array = null; // 旧评论榜

addEventListener('message', function(event: Object): boolean{
  const { data }: { data: Object } = event;
  // 初始化
  if(data.type === 'init'){
    wdsId = data.wdsId;
    moxiId = data.moxiId;
    title = data.title;

    // 初始化
    Promise.all([
      getData('POST', listUrl, `pro_id=${ wdsId }&type=1&page=1&pageSize=10000000000`),
      getData('POST', commentUrl, `pageNum=1&moxi_id=${ moxiId }&pro_id=${ wdsId }`)
    ]).then((result: Array<Object>)=>{
      const [data1, data2]: [Object, Object] = result;
      // 获取旧排行榜
      if(data1.status === '-1'){
        oldData = [];
      }else{
        oldData = data1.data;
      }
      // 获取旧评论榜
      if(data2.status === '-1'){
        oldComment = [];
      }else{
        oldComment = data2.des;
      }
      // 开启轮询
      polling();
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
  try{
    const ct: Object = await getData('POST', commentUrl, `pageNum=1&moxi_id=${ moxiId }&pro_id=${ wdsId }`);
    // 等于-1时报错
    if(ct.status !== '-1'){
      const { des }: { des: Array } = ct;
      let newData: Array = [];
      if(oldData.length === 0){
        // 无旧数据，不需要对比时间戳，只需要去掉评论
        for(let i: number = 0, j: number = des.length; i < j; i++){
          if(des[i].pay_amount !== ''){
            newData.push(des[i]);
          }
        }
      }else{
        // 有旧数据时，对比时间戳
        for(let i: number = 0, j: number = des.length; i < j; i++){
          if(des[i].ctime !== oldComment[0].ctime){
            if(des[i].pay_amount !== ''){
              newData.push(des[i]);
            }
          }else{
            break;
          }
        }
      }
      // 计算打赏金额和排名，newData数组的长度为0时集资不变
      if(newData.length > 0){
        // 获取新排名
        const bl: Object = await getData('POST', listUrl, `pro_id=${ wdsId }&type=1&page=1&pageSize=10000000000`);
        const len1: number = bl.data.length - 1;
        const amt: String = String((allMount(bl.data, 0, len1)).toFixed(2));  // 当前的总集资
        const jizi: Array = [];
        for(let i: Object = 0, j: Object = newData.length; i < j; i++){
          const item: Object = newData[i];
          const user_id: string = item.reply_fuid;                                                  // 当前用户的id
          const oldIndex: ?number = indexOf(oldData, user_id, 0, oldData.length - 1);               // 旧排名
          const newIndex: ?number = indexOf(bl.data, user_id, 0, len1);                             // 新排名
          const promote: number = oldIndex ? oldIndex - newIndex + 1 : oldData.length - newIndex;   // 排名提升
          jizi.push({
            user_id,
            pay_amount: item.pay_amount,          // 打赏金额
            nickname: item.c_userinfo.nickname,   // 用户昵称
            newIndex,
            promote: promote < 0 ? 0 : promote,
            allMount: amt
          });
        }
        // 更新旧对比数据
        oldData = bl.data;
        oldComment = ct.des;
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

/* 计算总集资数 */
function allMount(rawArray: Array, from: number, to: number): number{
  if(rawArray.length === 0){
    return 0;
  }
  // from === to时，返回获取到的集资数
  if(from === to){
    return Number(rawArray[from]['total_back_amount']);
  }
  // 拆分计算
  const middle: number = Math.floor((to - from) / 2) + from;
  const left: number = allMount(rawArray, from, middle);
  const right: number = allMount(rawArray, middle + 1, to);
  return left + right;
}

/* 查找索引，没有则返回null */
function indexOf(rawArray: Array, value: string, from: number, to: number): ?number{
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
  const middle: number = Math.floor((to - from) / 2) + from;
  const left: number = indexOf(rawArray, value, from, middle);
  if(left !== null){
    return left;
  }
  const right: number =indexOf(rawArray, value, middle + 1, to);
  if(right !== null){
    return right;
  }
  return null;
}