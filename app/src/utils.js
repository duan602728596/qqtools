/* 公共函数 */
const gui: Object = global.require('nw.gui');

/**
 * 自动补0
 * @param { number } num
 * @return { string }
 */
export function patchZero(num: number): string{
  if(num < 10){
    return `0${ num }`;
  }else{
    return `${ num }`;
  }
}

/**
 * 格式化时间
 * @param { string } modules       : 格式化的字符串
 * @param { number | null } timeStr: 时间戳
 * @return { string }
 */
export function time(modules: string, timeStr: ?number): string{
  const date: Object = timeStr ? new Date(timeStr) : new Date();
  const YY: number = date.getFullYear(),
    MM: number = date.getMonth() + 1,
    DD: number = date.getDate(),
    hh: number = date.getHours(),
    mm: number = date.getMinutes(),
    ss: number = date.getSeconds();

  return modules.replace(/Y{2}/, YY)
    .replace(/M{2}/, patchZero(MM))
    .replace(/D{2}/, patchZero(DD))
    .replace(/h{2}/, patchZero(hh))
    .replace(/m{2}/, patchZero(mm))
    .replace(/s{2}/, patchZero(ss));
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

/**
 * 字符串转换成正则表达式
 * @param { string } str
 * @return { ?RegExp }
 */
export function str2reg(str: string): ?RegExp{
  const str2: string[] = str.replace(/\s+/g, '').split(/\s*[,，]\s*/g); // 避免失误，所以使用了中文和英文字符
  // 去掉空字符串和纯数字
  for(let i: number = str2.length - 1; i >= 0; i--){
    if(str2[i] === '' || /^[0-9]+$/.test(str2[i])){
      str2.splice(i, 1);
    }
  }
  return str2.length === 0 ? null : new RegExp(`(${ str2.join('|') })`);
}

/**
 * 字符串转换成id的数组
 * @param { string } str
 * @return { Array<number> }
 */
export function str2numberArray(str: string): Array<number>{
  const str2: string[] = str.replace(/\s+/g, '').split(/\s*[,，]\s*/g); // 避免失误，所以使用了中文和英文字符
  const result: [] = [];
  // 去掉空字符串和纯数字
  for(let i: number = str2.length - 1; i >= 0; i--){
    if(/^[0-9]+$/.test(str2[i])){
      result.push(Number(str2[i]));
    }
  }
  return result;
}

/* 在浏览器上打开页面 */
export function handleOpenBrowser(href: string, event: Event): void{
  event.preventDefault();
  gui.Shell.openExternal(href);
}

/* 清除node的缓存 */
export function cleanRequireCache(id: string): void{
  const modulePath: string = global.require.resolve(id);

  if(module.parent){
    module.parent.children.splice(module.parent.children.indexOf(id), 1);
  }

  global.require.cache[modulePath] = null;
}