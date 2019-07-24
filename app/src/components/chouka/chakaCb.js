/* 查卡 */
import * as storagecard from './storagecard';

async function chakaCb(command, qq) {
  const { basic } = qq.option;

  if (!basic.isChouka || !command[1]) {
    return void 0;
  }

  const { db, cards } = qq.choukaJson;
  const kaResult = await storagecard.query2(db, command[1]);

  if (kaResult.length === 0) {
    await qq.sendMessage(`[${ command[1] }]：暂无卡片。`);

    return void 0;
  }

  const record = JSON.parse(kaResult[0].record);
  const strArr = [];

  for (let i = cards.length - 1; i >= 0; i--) {
    const item = cards[i];
    const strData = [];

    for (const item2 of item.data) {
      if (item2.id in record && record[item2.id] > 0) {
        strData.push(`${ item2.name } * ${ record[item2.id] }`);
      }
    }

    if (strData.length > 0) {
      let str = `【${ item.level }】`;

      str += `(${ strData.length }/${ item.data.length })：`;
      str += `\n${ strData.join('\n') }`;
      strArr.push(str);
    }
  }

  if (strArr.length === 0) {
    await qq.sendMessage(`[${ !command[1] }] 的查卡结果：暂无卡片。`);

    return void 0;
  } else {
    const msg = `[${ kaResult[0].nickname === '' ? !command[1] : kaResult[0].nickname }] 的查卡结果：\n${ strArr.join('\n') }`
      + `\n★积分：${ Number(kaResult[0].points) }`;

    await qq.sendMessage(msg);
  }
}

export default chakaCb;