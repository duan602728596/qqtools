/* 抽卡方法 */

/**
 * 生成随机数
 * @param { number } len: 长度
 */
function random(len) {
  return Math.floor(Math.random() * len);
}

function randomCards(cardsInformation) {
  const result = [];

  for (let i = 0, j = cardsInformation.length; i < j; i++) {
    const { level = '', length = 0, data } = cardsInformation[i];
    const len = data.length;

    if (!(data && Array.isArray(data) && data.length > 0)) {
      break;
    }

    // 生成每个等级的卡组
    for (let i1 = 0; i1 < length; i1++) {
      result.push({
        ...data[random(len)],
        level,
        levelNum: i // 卡组的等级
      });
    }
  }

  // 对卡组进行打乱
  const kazu = [];

  while (result.length > 0) {
    const index = random(result.length);

    kazu.push(result[index]);
    result.splice(index, 1);
  }

  return kazu;
}

/**
 * @param { Array } cardsInformation: 卡组信息
 * @param { number } choukaMoney    : 抽卡钱数
 * @param { number } money          : 钱数
 * @param { number } multiple       : 多抽倍数
 * @param { ?number } buka          : 补卡次数
 */
export function chouka(cardsInformation, choukaMoney, money, multiple = 0, buka = null) {
  // 是否为补卡
  const isBuKa = !(buka === null || buka === undefined);

  // 正常抽卡次数
  const zhengchangchouka = isBuKa ? buka : Math.floor(money / choukaMoney);

  // 多抽卡次数
  let duochoukacishu = 0;

  if (!isBuKa && multiple > 0 && zhengchangchouka >= multiple) {
    duochoukacishu = Math.floor(zhengchangchouka / multiple);
  }

  // 总抽卡次数
  const allchouka = zhengchangchouka + duochoukacishu;

  // 抽卡
  const result = {};

  for (let i = 0; i < allchouka; i++) {
    const rc = randomCards(cardsInformation);
    const item = {
      ...rc[random(rc.length)]
    };

    if (item.id in result) {
      result[item.id].length += 1;
    } else {
      item.length = 1;
      result[item.id] = item;
    }
  }

  return result;
}