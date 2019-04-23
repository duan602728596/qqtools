/* 补卡 */
import * as storagecard from './storagecard';
import { chouka } from './chouka';

async function bukaCb(command, qq, dataJson) {
  const { basic } = qq.option;

  if (!basic.isChouka || !qq.bukaQQNumber.includes(dataJson.user_id) || !command[1] || !/^[0-9]+$/.test(command[1])) {
    return void 0;
  }

  try {
    const { cards, money, multiple, db } = qq.choukaJson;

    const choukaStr = [];
    let cqImage = '';

    // 把卡存入数据库
    const kaResult = await storagecard.query(db, command[1]);
    const record = kaResult.length === 0 ? {} : JSON.parse(kaResult[0].record);

    const choukaResult = chouka(cards, money, null, multiple, command[2] ? Number(command[2]) : 1);

    for (const key in choukaResult) {
      const item2 = choukaResult[key];
      const str = `【${ item2.level }】${ item2.name } * ${ item2.length }`;

      choukaStr.push(str);

      if (item2.id in record) record[item2.id] += item2.length;
      else record[item2.id] = item2.length;
    }

    if (basic.isChoukaSendImage) {
      for (const key in choukaResult) {
        cqImage += `[CQ:image,file=${ choukaResult[key].image }]`;
      }
    }

    // 把卡存入数据库
    if (kaResult.length === 0) await storagecard.insert(db, command[1], '', record);
    else await storagecard.update2(db, command[1], record);

    await qq.sendMessage(`[${ command[1] }]的补卡结果为：\n${ choukaStr.join('\n') }${ cqImage }`);
  } catch (err) {
    console.error(err);
  }
}

export default bukaCb;