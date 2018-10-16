/* 查询最好的卡片 */

function bestCards(cards: Object, len: number): string{
  const result: [] = [];

  for(const key: string in cards){
    const item: Object = cards[key];

    if(result.length === 0){
      result.push(item);
      continue;
    }

    for(let i: number = 0, j: number = result.length; i < j; i++){
      const item2: Object = result[i];

      if(item.levelNum > item2.levelNum){
        result.splice(i, 0, item);
        break;
      }
    }
  }

  // 返回数据
  let str: string = '';

  for(let i: number = 0, j: number = len > result.length ? result.length : len; i < j; i++){
    const item: Object = result[i];

    str += `[CQ:image,file=${ item.image }]`;
  }

  return str;
}

export default bestCards;