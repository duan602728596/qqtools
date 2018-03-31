/* 抽卡算法 */
import { templateReplace } from '../../function';

/**
 * 生成随机数
 * @param { number } len: 长度
 */
function random(len: number): number{
  return Math.floor(Math.random() * len);
}

/* 生成卡组 */
function kazu(CARD: Object, len: { n: number, r: number, sr: number, ssr: number }): Array{
  const kz: Array = [];

  // 抽取ssr卡形成卡组
  for(let i: number = 0, j: number = CARD.SSR.length; i <len.ssr; i++){
    kz.push({
      ...CARD.SSR[random(CARD.SSR.length)],
      level: 'SSR'
    });
  }

  // 抽取sr卡形成卡组
  for(let i: number = 0, j: number = CARD.SR.length; i < len.sr; i++){
    kz.push({
      ...CARD.SR[random(j)],
      level: 'SR'
    });
  }

  // 抽取r卡形成卡组
  for(let i: number = 0, j: number = CARD.R.length; i < len.r; i++){
    kz.push({
      ...CARD.R[random(j)],
      level: 'R'
    });
  }

  // 抽取n卡形成卡组
  for(let i: number = 0, j: number = CARD.N.length; i < len.n; i++){
    kz.push({
      ...CARD.N[random(j)],
      level: 'N'
    });
  }

  // 乱序排列
  const kz2: Array = [];
  while(kz.length > 0){
    const index: number = random(kz.length);
    kz2.push(kz[index]);
    kz.splice(index, 1);
  }
  return kz2;
}

/**
 * 抽卡
 * 每隔三次重新生成卡组
 * @param { Object } CARD       : 抽卡的配置卡组
 * @param { number } choukaMoney: 单次抽卡钱数
 * @param { number } money      : 钱数
 * @param { Object } len        : 卡组数量配置
 */
function chouka(CARD: Object, choukaMoney: number, money: number, len: { n: number, r: number, sr: number, ssr: number }): Object{
  // 计算抽卡次数
  const l_128: number = Math.floor(money / (choukaMoney * 10)); // 128的档次可以抽多少次卡
  const l_12point8: number = Math.floor(money / choukaMoney);   // 12.8的档次可以抽多少次卡
  const bout: number = l_12point8 + l_128;                      // 总抽钱数
  let best: ?Object = null;                                     // 最好的卡

  // 抽卡
  const result: Array = [];
  let i: number = 0;
  let ka: ?Array = null;
  while(i < bout){
    if(i % 3 === 0){
      ka = kazu(CARD, len);
    }
    const index: number = random(ka.length);
    const item: Object = ka[index];
    // 获取卡的最该等级
    const L: Object = {
      N: 0,
      R: 1,
      SR: 2,
      SSR: 3
    };
    if(best === null){
      best = item;
    }else{
      if(L[item.level] > L[best.level]){
        best = item;
      }
    }
    result.push(item);
    i += 1;
  }

  return {
    result,
    best
  };
}

export default chouka;

/**
 * 取出卡组的id，转换成数组
 * @param { Array } rawArray
 */
export function record(rawArray: Array): Array<string>{
  const r: Array<string> = [];
  for(let i: number = 0, j: number = rawArray.length; i < j; i++){
    const item: Object = rawArray[i];
    r.push(item.id);
  }
  return r;
}

/**
 * 将卡组转换成对象，并输出文字
 * @param { Array } rawArray
 * @param { string } template: 文字模板
 */
export function choukaText(rawArray: Array, template: string): string{
  const r: Object = {};
  for(let i: number = 0, j: number = rawArray.length; i < j; i++){
    const item: Object = rawArray[i];
    if(item.id in r){
      r[item.id].len += 1;
    }else{
      r[item.id] = {
        len: 1,
        name: item.name,
        level: item.level
      };
    }
  }
  // 循环r，生成文字
  let txt: string = '';
  for(const key: string in r){
    const item: Object = r[key];
    txt += '\n' + templateReplace(template, {
      name: item.name,
      level: item.level,
      len: item.len
    });
  }
  return txt;
}