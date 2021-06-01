import * as oicq from 'oicq';
import type { MessageElem } from 'oicq';
import type { MessageChain } from '../qq.types';

/* 将mirai的数据格式转换成oicq的数据格式 */
export function miraiMessageTooicqMessage(miraiMessage: Array<MessageChain>): Array<MessageElem> {
  const oicqMessage: Array<MessageElem> = [];

  for (const item of miraiMessage) {
    switch (item.type) {
      case 'Plain':
        oicqMessage.push(oicq.segment.text(item.text));
        break;

      case 'Image':
        oicqMessage.push(oicq.segment.image((item.url ?? item.path)!));
        break;

      case 'At':
        oicqMessage.push(oicq.segment.at(item.target));
        break;

      case 'AtAll':
        oicqMessage.push({
          type: 'at',
          data: { qq: 'all' }
        });
        break;
    }
  }

  return oicqMessage;
}