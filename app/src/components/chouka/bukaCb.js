/* 补卡 */
import * as storagecard from './storagecard';
import { chouka } from './chouka';
import bestCards from './bestCards';

async function bukaCb(command: string[], qq: CoolQ, dataJson: Object): Promise<void>{
  const { basic }: { basic: Object } = qq.option;

  if(!basic.isChouka || !qq.bukaQQNumber.includes(dataJson.user_id) || !command[1] || !/^[0-9]+$/.test(command[1])){
    return void 0;
  }

  try{
    const { cards, money, multiple, db }: {
      cards: Array,
      money: number,
      multiple: number,
      db: Object
    } = qq.choukaJson;

    const choukaStr: string[] = [];
    let cqImage: string = '';

    // 把卡存入数据库
    const kaResult: [] = await storagecard.query(db, command[1]);
    const record: Object = kaResult.length === 0 ? {} : JSON.parse(kaResult[0].record);

    const choukaResult: Object = chouka(cards, money, null, multiple, command[2] ? Number(command[2]) : 1);
    let len: number = 0;  // 输出卡牌数量

    for(const key: string in choukaResult){
      const item2: Object = choukaResult[key];
      let str: string = `【${ item2.level }】${ item2.name } * ${ item2.length }`;
      if(basic.isChoukaSendImage && len < 5) str += `[CQ:image,file=${ item2.image }]`;
      choukaStr.push(str);

      if(item2.id in record){
        record[item2.id] += item2.length;
      }else{
        record[item2.id] = item2.length;
      }

      len += 1;
    }

    if(basic.isChoukaSendImage){
      cqImage = bestCards(choukaResult, 2);
    }

    // 把卡存入数据库
    if(kaResult.length === 0) await storagecard.insert(db, command[1], '', record);
    else await storagecard.update2(db, command[1], record);

    await qq.sendMessage(`[${ command[1] }]的补卡结果为：\n${ choukaStr.join('\n') }${ cqImage }`);
  }catch(err){
    console.error(err);
  }
}

export default bukaCb;