// @flow
/**
 * 根据uin查重
 */

function array2obj(rawArray: Array): Object{
  const o: Object = {};
  rawArray.forEach((item: Object, index: number): void=>{
    o[item.uin] = item;
  });
  return o;
}

/* 查询是否在旧群中，并返回一个数组 */
function getNewMinfo(oldData: Object, newData: Object): Array{
  const arr: Array = [];
  for(const key: string in newData){
    if(!(key in oldData)){
      arr.push(newData[key]);
    }
  }
  return arr;
}

addEventListener('message', function(event: Object): void{
  const { oldList, newList }: {
    oldList: Array,
    newList: Array
  } = event.data;

  const oldObj: Object = array2obj(oldList);
  const newObj: Object = array2obj(newList);

  const minfo: Array = getNewMinfo(oldObj, newObj);

  postMessage({
    minfo
  });

}, false);