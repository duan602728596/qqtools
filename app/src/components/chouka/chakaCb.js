/* 查卡 */
import * as storagecard from './storagecard';

async function chakaCb(command: string[], qq: CoolQ): Promise<void> {
  const { basic }: { basic: Object } = qq.option;

  if (!basic.isChouka || !command[1]) {
    return void 0;
  }

  const { db, cards }: {
    db: Object,
    cards: Array
  } = qq.choukaJson;
  const kaResult: [] = await storagecard.query2(db, command[1]);

  if (kaResult.length === 0) {
    await qq.sendMessage(`[${ command[1] }]：暂无卡片。`);

    return void 0;
  }

  const record: Object = JSON.parse(kaResult[0].record);
  const strArr: string[] = [];

  for (let i: number = cards.length - 1; i >= 0; i--) {
    const item: Object = cards[i];
    const strData: string[] = [];
    let str: string = `【${ item.level }】：`;

    for (const item2: Object of item.data) {
      if (item2.id in record && record[item2.id] > 0) {
        strData.push(`${ item2.name } * ${ record[item2.id] }`);
      }
    }

    if (strData.length > 0) {
      str += `\n${ strData.join('\n') }`;
      strArr.push(str);
    }
  }

  if (strArr.length === 0) {
    await qq.sendMessage(`[${ !command[1] }] 的查卡结果：暂无卡片。`);

    return void 0;
  } else {
    await qq.sendMessage(`[${ kaResult[0].nickname === '' ? !command[1] : kaResult[0].nickname }] 的查卡结果：\n${ strArr.join('\n') }`);
  }
}

export default chakaCb;