/* 口袋直播列表轮询事件 */
import $ from 'jquery';
import { getLiveList, getLiveInfo } from './roomListener';
import { time } from '../../utils';
import store from '../../store/store';
import Kd48listenerWorker from 'worker-loader?name=[hash:5].worker.js!./kd48listener.worker';

let oldList = {}; // 旧列表

function array2obj(rawArray) {
  const o = {};

  $.each(rawArray, (index, item) => {
    o[item.liveId] = item;
  });

  return o;
}

/* 初始化 */
export async function init() {
  try {
    const data = await getLiveList(0, true);

    if (data.status === 200 && 'liveList' in data.content) {
      // 以liveId作为键名，存成Object
      oldList = array2obj(data.content.liveList);
    }
  } catch (err) {
    console.error(err);
  }
}

/* 轮询 */
async function kd48timer() {
  try {
    // 获取新数据
    const data = await getLiveList(0, true);
    let newData = [];

    if (data.status === 200 && 'liveList' in data.content) {
      newData = data.content.liveList;
    }
    // 开启新计算线程
    const worker = new Kd48listenerWorker();
    const cb = async (event) => {
      const { newDataObj, newLive } = event.data;

      oldList = newDataObj; // 覆盖旧数据
      // 当有新直播时，遍历已登录的CoolQ，并发送数据
      if (newLive.length > 0) {
        const ll = store.getState().get('login').get('qqLoginList');
        const ll2 = ll instanceof Array ? ll : ll.toJS();

        // 发送数据
        for (let i1 = newLive.length - 1, j2 = ll2.length; i1 >= 0; i1--) {
          const item1 = newLive[i1]; // 直播列表中的对象

          for (let i2 = 0; i2 < j2; i2++) {
            const item2 = ll2[i2];
            const basic = item2.option.basic;

            if (
              basic.is48LiveListener // 开启直播功能
              && (
                basic.isListenerAll // 监听所有成员
                || (item2.members && item2.members.test(item1.userInfo.nickname)) // 正则匹配监听指定成员
                || (item2.memberId && item2.memberId.includes(item1.userId)) // id精确匹配监听指定成员
              )
            ) {
              const time1 = time('YY-MM-DD hh:mm:ss', Number(item1.ctime)),
                qq = item2;
              const streamPath = await getLiveInfo(item1.liveId);
              let text = `${ item1.userInfo.nickname } 开启了一个${ item1.liveType === 1 ? '直播' : '电台' }。\n`
                       + `直播标题：${ item1.title }\n`
                       + `开始时间：${ time1 }\n`
                       + `视频地址：${ streamPath.content.playStreamPath }`;

              // @所有人的功能
              if (basic.is48LiveAtAll) text = `[CQ:at,qq=all] ${ text }`;

              await qq.sendMessage(text);
            }
          }
        }
      }

      worker.removeEventListener('message', cb);
      worker.terminate();
    };

    worker.addEventListener('message', cb, false);
    worker.postMessage({
      oldData: oldList,
      newData
    });
  } catch (err) {
    console.error(err);
  }
}

export default kd48timer;