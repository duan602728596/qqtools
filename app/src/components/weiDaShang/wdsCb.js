/* 微打赏监听回调函数 */
import { templateReplace } from '../../function';
import WdsListWorker from 'worker-loader?name=worker/wdsList.js!../../webWorker/wdsList';

function wdsCb(command: string[], qq: SmartQQ): void{
  if(!command[2]){
    command[2] = '20';
  }

  if(qq.option.basic.isWds){
    // 微打赏功能开启
    switch(command[1]){
      // 获取整体信息
      case '0':
        getAllMount(qq);
        break;
      // 获取聚聚榜
      case '1':
      // 获取打卡榜
      case '2':
        list(qq.option.basic.wdsId, command[1], command[2], qq);
        break;
      // 发送微打赏相关信息
      default:
        sendWdsInfor(qq);
        break;
    }
  }else{
    // 微打赏功能未开启
    qq.sendMessage('[WARNING] 微打赏相关功能未开启。');
  }
}

/* 发送信息 */
async function sendWdsInfor(qq: SmartQQ): void{
  const text: string = templateReplace(qq.option.basic.wdsUrlTemplate, {
    wdsname: qq.wdsTitle,
    wdsid: qq.option.basic.wdsId
  });
  await qq.sendFormatMessage(text);
}

/* 新线程计算排名 */
async function list(proId: string, type: string, size: string, qq: SmartQQ): void{
  const worker: Worker = new WdsListWorker();
  const cb: Function = async (event: Event): void=>{
    await qq.sendFormatMessage(event.data.text);
    worker.removeEventListener('message', cb);
    worker.terminate();
  };
  worker.addEventListener('message', cb, false);
  worker.postMessage({
    proId,
    type,
    size,
    title: qq.wdsTitle
  });
}

/* 获取已集资金额 */
function getAllMount(qq: SmartQQ): void{
  const cb: Function = async (event: Event): void=>{
    if(event.data.type === 'allMount'){
      await qq.sendFormatMessage(`${ qq.wdsTitle }: ￥${ event.data.allMount }`);
      qq.wdsWorker.removeEventListener('message', cb);
    }
  };
  qq.wdsWorker.addEventListener('message', cb, false);
  qq.wdsWorker.postMessage({
    type: 'allMount'
  });
}

export default wdsCb;