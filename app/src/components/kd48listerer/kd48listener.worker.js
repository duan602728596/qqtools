/* 口袋直播查重计算 */

function array2obj(rawArray: Array): Object {
  const o: Object = {};

  rawArray.forEach((item: Object, index: number): void => {
    o[item.liveId] = item;
  });

  return o;
}

/* 查询是否在旧直播中，并返回一个数组 */
function getNewLive(oldData: Object, newData: Object): Array {
  const arr: Array = [];

  for (const key: string in newData) {
    if (!(key in oldData)) {
      arr.push(newData[key]);
    }
  }

  return arr;
}

addEventListener('message', function(event: Event): void {
  const { oldData, newData }: {
    oldData: Array,
    newData: Array
  } = event.data;
  // 先将新数据从Array转换成Object
  const newDataObj: Object = array2obj(newData);
  const newLive: Array = getNewLive(oldData, newDataObj);

  postMessage({
    newDataObj,
    newLive
  });

}, false);