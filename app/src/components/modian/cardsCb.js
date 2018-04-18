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
        for(const key: string in record){
          const item: number = record[key];
          const card: Object = array2Object(qq.card);
          if(key in card){
            txt += `[${ card[key].level }]${ card[key].name } * ${ item }, `;
          }else{
            txt += `${ key } * ${ item }, `;
          }
        }
      }
      qq.sendMessage(txt);
    },
    error(xhr: XMLHttpRequest, status: string, type: string): void{
      qq.sendMessage(xhr.responseJSON.message);
    }
  });
}

export default cardsCb;
