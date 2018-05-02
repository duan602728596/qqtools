/* 查询卡牌数量 */
import $ from 'jquery';

/* 将数组转化成字符串 */
function array2Object(obj: Object): Object{
  const result: Object = {};
  for(const key: string in obj){
    const item: Array = obj[key];
    for(let i: number = 0, j: number = item.length; i < j; i++){
      const item2: Object = item[i];
      item2.level = key;
      result[item2.id] = item2;
    }
  }
  return result;
}

function cardsCb(command: string[], qq: CoolQ): void{
  const basic: Object = qq.option.basic;
  // 如果没有昵称，取消查找
  if(command[1] === undefined){
    return void 0;
  }
  $.ajax({
    url: basic.choukaSearchUrl,
    dataType: 'json',
    type: 'POST',
    data: {
      nickname: command[1],
      token: basic.choukaToken
    },
    success(data: Object, status: string, xhr: XMLHttpRequest): void{
      let txt: string = `【${ command[1] }】的抽卡情况：`;
      if(data.length === 0){
        txt += '没有抽卡。';
      }else{
        const record: Object = JSON.parse(data[0].record);
        const card: Object = qq.card;
        // 获取N卡情况
        const nArray: [] = [];
        for(let i: number = 0, j: number = card.N.length; i < j; i++){
          const item: Object = card.N[i];
          if(item.id in record) nArray.push(`${ item.name } * ${ record[item.id] }`);
        }
        if(nArray.length > 0) txt += `\n【N】:\n${ nArray.join('，') }`;
        // 获取R卡情况
        const rArray: [] = [];
        for(let i: number = 0, j: number = card.R.length; i < j; i++){
          const item: Object = card.R[i];
          if(item.id in record) rArray.push(`${ item.name } * ${ record[item.id] }`);
        }
        if(rArray.length > 0) txt += `\n【R】:\n${ rArray.join('，') }`;
        // 获取SR卡情况
        const srArray: [] = [];
        for(let i: number = 0, j: number = card.SR.length; i < j; i++){
          const item: Object = card.SR[i];
          if(item.id in record) srArray.push(`${ item.name } * ${ record[item.id] }`);
        }
        if(srArray.length > 0) txt += `\n【SR】:\n${ srArray.join('，') }`;
        // 获取SSR卡情况
        const ssrArray: [] = [];
        for(let i: number = 0, j: number = card.SSR.length; i < j; i++){
          const item: Object = card.SSR[i];
          if(item.id in record) ssrArray.push(`${ item.name } * ${ record[item.id] }`);
        }
        if(ssrArray.length > 0) txt += `\n【SSR】:\n${ ssrArray.join('，') }`;
      }
      qq.sendMessage(txt);
    },
    error(xhr: XMLHttpRequest, status: string, type: string): void{
      qq.sendMessage(xhr.responseJSON.message);
    }
  });
}

export default cardsCb;
