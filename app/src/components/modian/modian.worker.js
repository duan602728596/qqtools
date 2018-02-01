/**
 * 摩点信息查询轮询
 *
 * 订单
 * [POST] https://wds.modian.com/api/project/orders
 * pro_id  : 微打赏id
 * page    : 页数
 * sign    : 签名
 */
import getData from './function/getData';
import sign from './function/signInWorker';

const dingDanUrl: string = 'https://wds.modian.com/api/project/orders';
let queryData: ?string = null; // 查询条件
let modianId: ?string = null;  // 摩点id
let title: ?string = null;     // 摩点项目标题
let timer: ?number = null;     // 轮询定时器
let oldTime: ?number = null;   // 最后一次的打赏时间

addEventListener('message', async function(event: Event): Promise<boolean>{
  const data: Object = event.data;
  // 初始化
  if(data.type === 'init'){
    modianId = data.modianId;
    title = data.title;

    // 初始化
    queryData = sign(`page=1&pro_id=${ modianId }`);
    const res: Object = await getData('POST', dingDanUrl + '?t=' + new Date().getTime(), queryData);
    oldTime = new Date(res.data[0].pay_time).getTime();

    // 开启轮询
    timer = setInterval(polling, 13000);
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
async function polling(): Promise<void>{
  try{
    // 获取新信息
    const res: Object = await getData('POST', dingDanUrl + '?t=' + new Date().getTime(), queryData);
    if(res.status === '0'){
      // 计算打赏金额和排名
      const newData: Array = res.data;
      const jizi: Array = [];
      let ot: ?number = null;
      for(let i: number = 0, j: number = newData.length; i < j; i++){
        const item: Object = newData[i];
        const pay_time: number = new Date(item.pay_time).getTime();
        if(pay_time > oldTime){
          jizi.push({
            pay_amount: item.backer_money,
            nickname: item.nickname
          });
          if(!ot) ot = pay_time;
        }else{
          break;
        }
      }
      if(jizi.length > 0){
        if(ot) oldTime = ot;
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