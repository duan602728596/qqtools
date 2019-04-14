/* 查询最好的卡片 */

function bestCards(cards, len) {
  const result = [];

  for (const key in cards) {
    const item = cards[key];

    if (result.length === 0) {
      result.push(item);
      continue;
    }

    for (let i = 0, j = result.length; i < j; i++) {
      const item2 = result[i];

      if (item.levelNum > item2.levelNum) {
        result.splice(i, 0, item);
        break;
      }
      // 当卡是最后一个时
      if (i === j - 1) result.push(item);
    }
  }

  // 返回数据
  const str = [];

  for (let i = 0, j = len > result.length ? result.length : len; i < j; i++) {
    const item = result[i];

    str.push(`[CQ:image,file=${ item.image }]`);
  }

  return str.join(' ');
}

export default bestCards;