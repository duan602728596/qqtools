/**
 * 摩点信息查询轮询
 * 文档地址：https://www.showdoc.cc/web/#/1702718?page_id=15700669
 */
import getData from './function/getData';
import sign from './function/signInWorker';

const dingDanUrl = 'https://wds.modian.com/api/project/sorted_orders';
const inforUrl = 'https://wds.modian.com/api/project/detail';
const dingDanUrlNoIdol = 'http://mapi.modian.com/v45/product/comment_list';
const inforUrlNoIdol = 'http://sapi.modian.com/v45/main/productInfo';

let queryData = null;  // 查询条件
let queryInfor = null; // 查询摩点项目信息条件
let modianId = null;   // 摩点id
let title = null;      // 摩点项目标题
let goal = null;       // 摩点项目目标
let timer = null;      // 轮询定时器
let oldTime = null;    // 最后一次的打赏时间
let oldId = null;      // 最后一次打赏的id
let moxiId = null;

function timeDifference(endTime) {
  const endTimeDate = new Date(endTime);
  const nowTimeDate = new Date();
  // time
  const endTimeNumber = endTimeDate.getTime();
  const nowTimeNumber = nowTimeDate.getTime();

  let day = 0;
  let hour = 0;
  let minute = 0;
  let second = 0;

  if (nowTimeNumber >= endTimeNumber) {
    return '0秒';
  }

  const cha = parseInt((endTimeDate - nowTimeDate) / 1000);

  // 计算天数
  day = Math.floor(cha / 86400);

  // 计算小时
  const dayRemainder = cha % 86400;

  hour = Math.floor(dayRemainder / 3600);

  // 计算分钟
  const hourRemainder = dayRemainder % 3600;

  minute = Math.floor(hourRemainder / 60);

  // 计算秒
  second = hourRemainder % 60;

  let str = '';

  if (day > 0) str += `${ day }天${ hour }时${ minute }分`;

  else if (hour > 0) str += `${ hour }时${ minute }分`;

  else if (minute > 0) str += `${ minute }分`;

  str += `${ second }秒`;

  return str;
}

/* 轮询事件 */
async function polling() {
  try {
    // 获取新信息
    const inf = await getData('POST', inforUrl + '?t=' + new Date().getTime(), queryInfor);
    const jizi = [];
    let page = 1;
    let hasData = true;
    let ot = null; // 最新集资时间

    while (hasData) {
      const q = sign(`page=${ page }&pro_id=${ modianId }&sort_by=1`);
      const res = await getData('POST', dingDanUrl + '?t=' + new Date().getTime(), q);

      if (res.status === '0' && res.data && res.data.length > 0) {
        const newData = res.data; // 计算打赏金额和排名

        for (let i = 0, j = newData.length; i < j; i++) {
          const item = newData[i];
          const pay_time = new Date(item.pay_success_time).getTime();

          if (pay_time > oldTime) {
            jizi.push({
              userid: item.user_id,
              pay_amount: item.backer_money,
              nickname: item.nickname
            });

            if (!ot) ot = pay_time;
          } else {
            hasData = false;
            break;
          }
        }

        page += 1;
      } else {
        hasData = false;
      }
    }

    if (jizi.length > 0) {
      if (ot) oldTime = ot;

      // 将数据发送回主线程
      const infData = inf.data[0];

      postMessage({
        type: 'change',
        data: jizi,
        alreadyRaised: infData.already_raised,
        backerCount: infData.backer_count,
        endTime: infData.end_time,
        timedifference: timeDifference(infData.end_time)
      });
    }
  } catch (err) {
    console.error(err);
  }
}

/* 轮询事件 */
async function pollingNoIdol() {
  try {
    // 获取新信息
    const inf = await getData('POST', inforUrlNoIdol + '?t=' + new Date().getTime(), queryInfor);
    const jizi = [];
    let page = 1;
    let hasData = true;
    let ot = null;  // 最新集资时间
    let oid = null; // 最新集资id

    while (hasData) {
      const res = await getData(
        'GET',
        dingDanUrlNoIdol + '?t=' + new Date().getTime() + '&' + queryData + '&page_index=' + (page * 10)
      );

      if (res.status === '0' && res.data && res.data.length > 0) {
        const newData = res.data; // 计算打赏金额和排名

        for (let i = 0, j = newData.length; i < j; i++) {
          const item = newData[i];
          const pay_time = new Date(item.ctime).getTime();
          const pay_amount = Number(item.pay_amount) / 100;
          const id = String(res.data[0].user_id.id);

          if (((pay_time > oldTime) || (pay_time === oldTime && id !== oldId)) && pay_amount > 0) {
            jizi.push({
              userid: item.user_id,
              pay_amount,
              nickname: item.user_info.username
            });

            if (!ot) ot = pay_time;
            if (!oid) oid = id;
          } else {
            hasData = false;
            break;
          }
        }

        page += 1;
      } else {
        hasData = false;
      }
    }

    if (jizi.length > 0) {
      if (ot) oldTime = ot;
      if (oid) oldId = oid;

      // 将数据发送回主线程
      const infData = inf.data.product_info;

      postMessage({
        type: 'change',
        data: jizi,
        alreadyRaised: infData.backer_money,
        backerCount: infData.backer_count,
        endTime: infData.end_time,
        timedifference: timeDifference(infData.end_time)
      });
    }
  } catch (err) {
    console.error(err);
  }
}

addEventListener('message', async function(event) {
  try {
    const data = event.data;

    // 初始化
    if (data.type === 'init') {
      modianId = data.modianId;
      title = data.title;
      goal = data.goal;
      moxiId = data.moxiId;

      // 初始化
      queryData = moxiId
        ? `json_type=1&pro_id=${ modianId }&moxi_post_id=${ moxiId }`
        : sign(`page=1&pro_id=${ modianId }&sort_by=1`);
      queryInfor = moxiId
        ? `pro_id=${ modianId }`
        : sign(`pro_id=${ modianId }`);

      const res = moxiId
        ? await getData('GET', dingDanUrlNoIdol + '?t=' + new Date().getTime() + '&' + queryData)
        : await getData('POST', dingDanUrl + '?t=' + new Date().getTime(), queryData);
      const nullData = res.data === null || res.data === 'null' || res.status !== '0' || res.data.length === 0;

      oldTime = nullData
        ? new Date().getTime()
        : new Date(res.data[0].pay_success_time || res.data[0].ctime).getTime();

      oldId = nullData
        ? null
        : String(res.data[0].user_id.id);

      // 开启轮询
      timer = setInterval(moxiId ? pollingNoIdol : polling, 13000);

      return true;
    }
    // 关闭
    if (data.type === 'cancel') {
      if (timer) {
        clearInterval(timer);
      }

      return true;
    }
  } catch (err) {
    console.error(err);
  }
}, false);
