// @flow
/**
 * 根据uin查重
 */

function objMerge(obj1: Object, obj2: Object): Object{
  for(const key: string in obj1){
    obj2[key] = obj1[key];
  }
  return obj2;
}

function array2obj(rawArray: Array, from: number, to: number): Object{
  const len: number = rawArray.length;
  if(len === 1){
    return rawArray[from];
  }

  if(len === 2){
    return objMerge(rawArray[from], rawArray[to]);
  }

  const middle: number = Math.floor((to - from) / 2) + from;
  const left: Object = array2obj(rawArray, from, middle);
  const right: Object = array2obj(rawArray, middle + 1, to);
  return array2obj(left, right);
}

/* 查询是否在旧群中，并返回一个数组 */
function getNewMinfo(oldData: Object, newList: Array, from: number, to: number): Array{
  if(from === to){
    if(newList[from].uin in oldData){
      return newList[from];
    }else{
      return [];
    }
  }

  const middle: number = Math.floor((to - from) / 2) + from;
  const left: Array = getNewMinfo(oldData, newList, from, middle);
  const right: Array = getNewMinfo(oldData, newList, middle + 1, to);
  return left.concat(right);
}

addEventListener('message', function(event: Object): void{
  const { oldList, newList }: {
    oldList: Array,
    newList: Array
  } = event.data;

  const oldObj: Object = oldList.length > 0 ? array2obj(oldList) : {};
  const minfo: Array = newList.length > 0 ? getNewMinfo(oldObj, newList, 0, newList.length - 1) : [];

  postMessage({
    minfo
  });

}, false);