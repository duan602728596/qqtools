/* 微打赏监听回调函数 */
import getModianInformation from './getModianInformation';
import { templateReplace } from '../../function';
import ModianListWorker from 'worker-loader?name=script/modianList_[hash]_worker.js!./modianList.worker';

function modianCb(command: string[], qq: SmartQQ): void{
  if(!command[2]){
    command[2] = '20';
  }

  if(qq.option.basic.isModian){
    // 微打赏功能开启
    switch(command[1]){
      // 获取整体信息
      case '0':
      case '项目信息':
        getAllMount(qq);
        break;
      // 获取聚聚榜
      case '1':
      case '聚聚榜':
      // 获取打卡榜
      case '2':
      case '打卡榜':
        // 命令兼容
        if(command[1] === '聚聚榜'){
          command[1] = '1';
        }else if(command[1] === '打卡榜'){
          command[1] = '2';
        }
        list(qq.option.basic.modianId, command[1], command[2], qq);
        break;
      // 获取订单信息
      case '3':
      case '订单':
        dingDan(qq.option.basic.modianId, command[2], qq);
        break;
      // 发送微打赏相关信息
      default:
        sendModianInfor(qq);
        break;
    }
  }else{
    // 微打赏功能未开启
    qq.sendMessage('[WARNING] 摩点相关功能未开启。');
  }
}

/* 发送信息 */
async function sendModianInfor(qq: SmartQQ): Promise<void>{
  const text: string = templateReplace(qq.option.basic.modianUrlTemplate, {
    modianname: qq.modianTitle,
    modianid: qq.option.basic.modianId
  });
  await qq.sendFormatMessage(text);
}

/* 新线程计算排名 */
async function list(proId: string, type: string, size: string, qq: SmartQQ): Promise<void>{
  const worker: Worker = new ModianListWorker();
  const cb: Function = async(event: Event): Promise<void>=>{
    await qq.sendFormatMessage(event.data.text);
    worker.removeEventListener('message', cb);
    worker.terminate();
  };
  worker.addEventListener('message', cb, false);
  worker.postMessage({
    proId,
    type,
    size,
    title: qq.modianTitle
  });
}

/* 获取订单信息 */
async function dingDan(proId: string, size: string, qq: SmartQQ): Promise<void>{
  const worker: Worker = new ModianListWorker();
  const cb: Function = async(event: Event): Promise<void>=>{
    await qq.sendFormatMessage(event.data.text);
    worker.removeEventListener('message', cb);
    worker.terminate();
  };
  worker.addEventListener('message', cb, false);
  worker.postMessage({
    proId,
    type: '订单',
    size,
    title: qq.modianTitle
  });
}

/* 获取已集资金额 */
async function getAllMount(qq: SmartQQ): Promise<void>{
  const data: {
    already_raised: number,
    backer_count: number,
    end_time: string
  } = await getModianInformation(qq.option.basic.modianId);
  await qq.sendMessage(`${ qq.modianTitle }: ￥${ data.already_raised } / ￥${ qq.modianGoal }，`
    + `\n集资人数：${ data.backer_count }\n项目截至日期：${ data.end_time }`
  );
}

export default modianCb;