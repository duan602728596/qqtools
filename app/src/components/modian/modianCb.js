/* 微打赏监听回调函数 */
import getModianInformation from './getModianInformation';
import { templateReplace } from '../../utils';
import ModianListWorker from 'worker-loader?name=script/[hash:5].worker.js!./modianList.worker';

/* 发送信息 */
async function sendModianInfor(qq: CoolQ): Promise<void> {
  try {
    const text: string = templateReplace(qq.option.basic.modianUrlTemplate, {
      modianname: qq.modianTitle,
      modianid: qq.option.basic.modianId
    });

    await qq.sendMessage(text);
  } catch (err) {
    console.error(err);
  }
}

/* 新线程计算排名 */
function list(proId: string, type: string, size: string, qq: CoolQ): void {
  try {
    const worker: Worker = new ModianListWorker();
    const cb: Function = async (event: Event): Promise<void> => {
      await qq.sendMessage(event.data.text);
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
  } catch (err) {
    console.error(err);
  }
}

/* 获取订单信息 */
function dingDan(proId: string, size: string, qq: CoolQ): void {
  const worker: Worker = new ModianListWorker();
  const cb: Function = async (event: Event): Promise<void> => {
    await qq.sendMessage(event.data.text);
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
async function getAllMount(qq: CoolQ): Promise<void> {
  const data: {
    already_raised: number,
    backer_count: number,
    end_time: string
  } = await getModianInformation(qq.option.basic.modianId);

  await qq.sendMessage(`${ qq.modianTitle }: ￥${ data.already_raised } / ￥${ qq.modianGoal }，`
                     + `\n集资人数：${ data.backer_count }\n项目截至日期：${ data.end_time }`);
}

function modianCb(command: string[], qq: CoolQ): void {
  if (!command[2]) {
    command[2] = '20';
  }

  const { basic }: { basic: Object } = qq.option;

  // 摩点功能未开启
  if (!basic.isModian) return void 0;

  const { isModianLeaderboard, modianId }: {
    isModianLeaderboard: boolean,
    modianId: string
  } = basic;

  switch (command[1]) {
    // 获取整体信息
    case '0':
    case '项目信息':
      isModianLeaderboard && getAllMount(qq);
      break;
    // 获取聚聚榜
    case '1':
    case '聚聚榜':
    // 获取打卡榜
    case '2':
    case '打卡榜':
      // 命令兼容
      if (command[1] === '聚聚榜') {
        command[1] = '1';
      } else if (command[1] === '打卡榜') {
        command[1] = '2';
      }
      isModianLeaderboard && list(modianId, command[1], command[2], qq);
      break;
    // 获取订单信息
    case '3':
    case '订单':
      isModianLeaderboard && dingDan(modianId, command[2], qq);
      break;
    // 发送微打赏相关信息
    default:
      sendModianInfor(qq);
      break;
  }
}

export default modianCb;