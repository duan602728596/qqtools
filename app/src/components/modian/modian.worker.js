/**
 * 摩点信息查询轮询
 * 文档地址：https://www.showdoc.cc/web/#/1702718?page_id=15700669
 */
import getData from './function/getData';
import sign from './function/signInWorker';

const dingDanUrl: string = 'https://wds.modian.com/api/project/sorted_orders';
const inforUrl: string = 'https://wds.modian.com/api/project/detail';

let queryData: ?string = null;   // 查询条件
let queryInfor: ?string = null;  // 查询摩点项目信息条件
let modianId: ?string = null;    // 摩点id
let title: ?string = null;       // 摩点项目标题
let goal: ?string = null;        // 摩点项目目标
let timer: ?number = null;       // 轮询定时器
let oldTime: ?number = null;     // 最后一次的打赏时间

addEventListener('message', async function(event: Event): Promise<boolean>{
  try{
    const data: Object = event.data;
    // 初始化
    if(data.type === 'init'){
      modianId = data.modianId;
      title = data.title;
      goal = data.goal;

      // 初始化
      queryData = sign(`page=1&pro_id=${ modianId }&sort_by=1`);
      queryInfor = sign(`pro_id=${ modianId }`);
      const res: Object = await getData('POST', dingDanUrl + '?t=' + new Date().getTime(), queryData);
      oldTime = res.data === null ? new Date().getTime() : new Date(res.data[0].pay_success_time).getTime();

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
  }catch(err){
    console.error(err);
  }
}, false);

/* 轮询事件 */
async function polling(): Promise<void>{
  try{
    // 获取新信息
    const res: Object = await getData('POST', dingDanUrl + '?t=' + new Date().getTime(), queryData);
    const inf: Object = await getData('POST', inforUrl + '?t=' + new Date().getTime(), queryInfor);

    if(res.status === '0'){
      // 计算打赏金额和排名
      const newData: Array = res.data;
      const jizi: Array = [];
      let ot: ?number = null; // 最新集资时间

      for(let i: number = 0, j: number = newData.length; i < j; i++){
        const item: Object = newData[i];
        const pay_time: number = new Date(item.pay_success_time).getTime();
        if(pay_time > oldTime){
          jizi.push({
            userid: item.user_id,
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
        const infData: Object = inf.data[0];

        postMessage({
          type: 'change',
          data: jizi,
          alreadyRaised: infData.already_raised,
          backerCount: infData.backer_count,
          endTime: infData.end_time,
          timedifference: timeDifference(infData.end_time)
        });
      }
    }
  }catch(err){
    console.error(err);
  }
}

function timeDifference(endTime: string): string{
  const endTimeDate: Date = new Date(endTime);
  const nowTimeDate: Date = new Date();
  // time
  const endTimeNumber: number = endTimeDate.getTime();
  const nowTimeNumber: number = nowTimeDate.getTime();

  let day: number = 0;
  let hour: number = 0;
  let minute: number = 0;
  let second: number = 0;

  if(nowTimeNumber >= endTimeNumber){
    return '0秒';
  }

  const cha: number = parseInt((endTimeDate - nowTimeDate) / 1000);

  // 计算天数
  day = Math.floor(cha / 86400);

  // 计算小时
  const dayRemainder: number = cha % 86400;
  hour = Math.floor(dayRemainder / 3600);

  // 计算分钟
  const hourRemainder: number = dayRemainder % 3600;
  minute = Math.floor(hourRemainder / 60);

  // 计算秒
  second = hourRemainder % 60;

  let str: string = '';

  if(day > 0) str += `${ day }天${ hour }时${ minute }分`;

  else if(hour > 0) str += `${ hour }时${ minute }分`;

  else if(minute > 0) str += `${ minute }分`;

  str += `${ second }秒`;

  return str;
}