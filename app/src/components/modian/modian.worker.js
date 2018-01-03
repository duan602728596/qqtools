/**
 * 摩点信息查询轮询
 *
 * 订单
 * [POST] https://wds.modian.com/api/project/orders
 * pro_id  : 微打赏id
 * page    : 页数
 * sign    : 签名
 */
import MD5 from 'md5.js';
import getData from './function/getData';

const listUrl: string = `https://wds.modian.com/api/project/orders`;
let sign: ?string = null;      // 签名
let queryData: ?string = null; // 查询条件
let modianId: ?string = null;  // 摩点id
let title: ?string = null;     // 摩点项目标题
let timer: ?number = null;     // 轮询定时器
let oldTime: ?number = null;   // 最后一次的打赏时间

addEventListener('message', async function(event: Event): boolean{
  const data: Object = event.data;
  // 初始化
  if(data.type === 'init'){
    modianId = data.modianId;
    title = data.title;

    // 初始化
    let data2: string = `page=1&pro_id=${ modianId }`;
    const signStr: string = new MD5().update(data2 + '&p=das41aq6').digest('hex');
    sign = signStr.substr(5, 16);
    queryData = data2 + '&sign=' + sign;
    const res: Object = await getData('POST', listUrl, queryData);
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
async function polling(): void{
  try{
    // 获取新信息
    const res: Object = await getData('POST', listUrl, queryData);
    if(res.status === '0'){
      // 计算打赏金额和排名
      const newData: Array = res.data;
      const jizi: Array = [];
      let ot: ?number = null;
      for(let i: Object = 0, j: Object = newData.length; i < j; i++){
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
