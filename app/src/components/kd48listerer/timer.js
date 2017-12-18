/* 口袋直播列表轮询事件 */
import post from './post';
import { time } from '../../function';
import store from '../../store/store';
import Kd48listenerWorker from 'worker-loader?name=script/kd48listener.worker.js!./kd48listener.worker';

let oldList: Object = {};  // 旧列表

function array2obj(rawArray: Array): Object{
  const o: Object = {};
  $.each(rawArray, (index: number, item: Object): void=>{
    o[item.liveId] = item;
  });
  return o;
}

/* 初始化 */
export async function init(){
  const data: string = await post();
  const data2: Object = JSON.parse(data);
  if(data2.status === 200 && 'liveList' in data2.content){
    // 以liveId作为键名，存成Object
    oldList = array2obj(data2.content.liveList);
  }
}

/* 轮询 */
async function kd48timer(){
  // 获取新数据
  const data = await post();
  const data2: Object = JSON.parse(data);
  let newData: Array = [];
  if(data2.status === 200 && 'liveList' in data2.content){
    newData = data2.content.liveList;
  }
  // 开启新计算线程
  const worker: Worker = new Kd48listenerWorker();
  const cb: Function = async (event: Event): void=>{
    const { newDataObj, newLive }: {
      newDataObj: Object,
      newLive: Array
    } = event.data;
    oldList = newDataObj; // 覆盖旧数据
    // 当有新直播时，遍历已登录的SmartQQ，并发送数据
    if(newLive.length > 0){
      const ll: Object | Array = store.getState().get('login').get('qqLoginList');
      const ll2: Array = ll instanceof Array ? ll : ll.toJS();

      // 发送数据
      for(let i1: number = newLive.length - 1, j2: number = ll2.length; i1 >= 0; i1--){
        const item1: Object = newLive[i1];
        for(let i2: number = 0; i2 < j2; i2++){
          const item2: Object = ll2[i2];
          if(
            item2.option.basic.is48LiveListener &&                // 开启直播功能
            (
              item2.option.basic.isListenerAll ||                 // 监听所有成员
              (item2.members && item2.members.test(item1.title))  // 监听指定成员
            )
          ){
            const member: string = item1.title.split('的')[0],
              subTitle: string = item1.subTitle,
              time1: string = time('YY-MM-DD hh:mm:ss', item1.startTime),
              streamPath: string = item1.streamPath,
              qq: SmartQQ = item2;
            const text: string = `[ ${ member } ]开启了一个直播。\n` +
              `直播标题：${ subTitle }\n` +
              `开始时间：${ time1 }\n` +
              `视频地址：${ streamPath }`;
            await qq.sendFormatMessage(text);
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
}

export default kd48timer;