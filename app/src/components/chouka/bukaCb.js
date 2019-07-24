/* 补卡 */
import chunk from 'lodash-es/chunk';
import * as storagecard from './storagecard';
import { chouka } from './chouka';
import bestCards from './bestCards';
import getLevelPoint from '../chouka/getLevelPoint';

async function bukaCb(command, qq, dataJson) {
  const { basic } = qq.option;

  if (!basic.isChouka || !qq.bukaQQNumber.includes(dataJson.user_id) || !command[1] || !/^[0-9]+$/.test(command[1])) {
    return void 0;
  }

  try {
    const { cards, money, multiple, db, sendImageLength, resetCardsToPoints } = qq.choukaJson;
    const levelPoint = getLevelPoint(cards); // 格式化等级对应的分数
    const choukaStr = [];
    let cqImage = '';
    let cardsPointsMsg = '';

    // 把卡存入数据库
    const kaResult = await storagecard.query(db, command[1]);
    const record = kaResult.length === 0 ? {} : JSON.parse(kaResult[0].record);
    let cardsPoints = 0; // 积分
    const choukaResult = chouka(cards, money, null, multiple, command[2] ? Number(command[2]) : 1);

    for (const key in choukaResult) {
      const item2 = choukaResult[key];
      const str = `【${ item2.level }】${ item2.name } * ${ item2.length }`;

      choukaStr.push(str);

      if (resetCardsToPoints) {
        // 转换成积分
        if (item2.id in record) {
          // 有重复的卡片
          cardsPoints += levelPoint[item2.level] * item2.length;
        } else {
          // 新卡片
          record[item2.id] = 1;
          cardsPoints += levelPoint[item2.level] * (item2.length - 1);
        }
      } else {
        // 不转换成积分
        if (item2.id in record) {
          // 有重复的卡片
          record[item2.id] += item2.length;
        } else {
          // 新卡片
          record[item2.id] = item2.length;
        }
      }
    }

    if (resetCardsToPoints) {
      cardsPointsMsg = `\n已经将重复的卡片转换成积分：${ cardsPoints }。`;
    }

    if (basic.isChoukaSendImage && qq.coolqEdition === 'pro') {
      const cqArr = [];

      if (sendImageLength === undefined || sendImageLength === null) {
        for (const key in choukaResult) {
          cqArr.push(`[CQ:image,file=${ choukaResult[key].image }]`);
        }
      } else {
        cqArr.push(...bestCards(cards, sendImageLength === 0 ? Object.values(choukaResult).length : sendImageLength));
      }

      const chunkArr = chunk(cqArr, 10);
      const sendArr = [];

      for (const item of chunkArr) {
        sendArr.push(item.join(''));
      }

      cqImage += sendArr.join('[qqtools:stage]');
    }

    // 把卡存入数据库
    if (kaResult.length === 0) {
      await storagecard.insert(db, command[1], '', record, (kaResult[0].points || 0) + cardsPoints);
    } else {
      await storagecard.update2(db, command[1], record, (kaResult[0].points || 0) + cardsPoints);
    }

    await qq.sendMessage(`[${ command[1] }]的补卡结果为：\n${ choukaStr.join('\n') }${ cardsPointsMsg }${ cqImage }`);
  } catch (err) {
    console.error(err);
  }
}

export default bukaCb;