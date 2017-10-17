/* 口袋直播查重计算 */

function array2obj(rawArray){
  const o = {};
  rawArray.forEach((item, index)=>{
    o[item.liveId] = item;
  });
  return o;
}

/* 查询是否在旧直播中，并返回一个数组 */
function getNewLive(oldData, newData){
  const arr = [];
  for(const key in newData){
    if(!(key in oldData)){
      arr.push(newData[key]);
    }
  }
  return arr;
}

addEventListener('message', function(event){
  const { oldData, newData } = event.data;
  // 先将新数据从Array转换成Object
  const newDataObj = array2obj(newData);
  const newLive = getNewLive(oldData, newDataObj);

  postMessage({
    newDataObj,
    newLive
  });

}, false);
