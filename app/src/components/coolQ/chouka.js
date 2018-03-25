/**
 * 抽卡算法
 *
 * 抽卡概率：
 *   ssr: 1%
 *   sr : 6%
 *   r  : 28%
 *   n  : 65%
 *
 * 抽卡次数为12.8的倍数，128抽11次
 */

/**
 * 生成随机数
 * @param { number } len: 长度
 */
function random(len: number): number{
  return Math.floor(Math.random() * len);
}

/* 生成长度为50的卡组 */
const _N: number = 65;     // 抽取N卡数量
const _R: number = 28;     // 抽取R卡数量
const _SR: number = 5;     // 抽取SR卡数量
const _SSR: number = 2;    // 抽取SSR卡数量
function kazu(CARD: Object): Array{
  const kz: Array = [];

  // 抽取ssr卡形成卡组
  for(let i: number = 0, j: number = CARD.SSR.length; i < _SSR; i++){
    kz.push({
      ...CARD.SSR[random(CARD.SSR.length)],
      level: 'SSR'
    });
  }

  // 抽取sr卡形成卡组
  for(let i: number = 0, j: number = CARD.SR.length; i < _SR; i++){
    kz.push({
      ...CARD.SR[random(j)],
      level: 'SR'
    });
  }

  // 抽取r卡形成卡组
  for(let i: number = 0, j: number = CARD.R.length; i < _R; i++){
    kz.push({
      ...CARD.R[random(j)],
      level: 'R'
    });
  }

  // 抽取n卡形成卡组
  for(let i: number = 0, j: number = CARD.N.length; i < _N; i++){
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
 */
function chouka(CARD: Object, choukaMoney: number, money: number): Array{
  // 计算抽卡次数
  const l_128: number = Math.floor(money / (choukaMoney * 10)); // 128的档次可以抽多少次卡
  const l_12point8: number = Math.floor(money / choukaMoney);   // 12.8的档次可以抽多少次卡
  const bout: number = l_12point8 + l_128;

  // 抽卡
  const result: Array = [];
  let i: number = 0;
  let ka: ?Array = null;
  while(i < bout){
    if(i % 3 === 0){
      ka = kazu(CARD);
    }
    const index: number = random(ka.length);
    result.push(ka[index]);
    i += 1;
  }

  return result;
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
 */
export function choukaText(rawArray: Array): string{
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
    txt += `\n${ item.name }【${ item.level }】x${ item.len }`;
  }
  return txt;
}