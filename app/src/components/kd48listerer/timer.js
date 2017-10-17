/* 口袋直播列表轮询事件 */
import jQuery from 'jquery';
import post from './post';
import { time } from '../../function';
import store from '../../store/store';

let oldList: Object = {};  // 旧列表

function array2obj(rawArray: Array): Object{
  const o: Object = {};
  jQuery.each(rawArray, (index: number, item: Object): void=>{
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
  const worker: Worker = new Worker('../webWorker/kd48listener.js');
  const cb: Function = (event: Object): void=>{
    const { newDataObj, newLive }: {
      newDataObj: Object,
      newLive: Array
    } = event.data;
    oldList = newDataObj; // 覆盖旧数据

    // 当有新直播时，遍历已登录的SmartQQ，并发送数据
    if(newLive.length > 0){
      const ll: Object | Array = store.getState().get('login').get('qqLoginList');
      const ll2: Array = ll instanceof Array ? ll : ll.toJS();

      jQuery.each(newLive.length, (index: number, item: Object): void=>{
        // 遍历所有登录的QQ
        jQuery.each(ll2, (index2: number, item2: SmartQQ): void=>{
          // 已开启口袋监听功能，且成员匹配
          if(item2.option.is48LiveListener && item2.members && item2.members.test(item.title)){
            const text: string = `[ ${ item.title.match(item2.members)[0] } ]开启了一个直播，\n` +
              `直播标题：${ item.subTitle }\n` +
              `开始时间：${ time('YY-MM-DD hh:mm:ss', item.startTime) }\n` +
              `视频地址：${ item.streamPath }`;
            item2.sendFormatMessage(text);
          }
        });
      });
    }
  };
  worker.postMessage({
    oldData: oldList,
    newData
  });
}

export default kd48timer;