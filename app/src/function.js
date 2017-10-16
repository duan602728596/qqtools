// @flow
/* 公共函数 */

/**
 * 将对象转换成一个数组
 * @param { Object } obj
 * @return { Array }
 */
export function objectToArray(obj: Object): Function[]{
  const arr: Array = [];
  for(let key in obj){
    arr.push(obj[key]);
  }
  return arr;
}

/**
 * 模板替换
 * @param { String } template: 模板
 * @param { Object } data    : 数据
 */
export function templateReplace(template: string, data: Object): string{
  return template.replace(/{{\s*[a-zA-Z0-9_]+\s*}}/g, (text: string): string=>{
    const key: string = text.match(/[a-zA-Z0-9_]+/g);
    if(key in data){
      return data[key];
    }else{
      return '';
    }
  });
}