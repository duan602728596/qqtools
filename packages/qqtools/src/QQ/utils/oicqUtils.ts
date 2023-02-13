import * as oicq from 'oicq';
import type { MessageElem, EventData, GroupMessageEventData, MemberIncreaseEventData } from 'oicq';
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

/* 判断为群信息 */
export function isGroupMessageEventData(data: EventData | MemberIncreaseEventData | {
  post_type: 'meta_event';
  meta_event_type: 'heartbeat';
}): data is GroupMessageEventData {
  return data.post_type === 'message' && data.message_type === 'group';
}

/* 判断为有人入群 */
export function isMemberIncreaseEventData(data: EventData | MemberIncreaseEventData | {
  post_type: 'meta_event';
  meta_event_type: 'heartbeat';
}): data is MemberIncreaseEventData {
  return data.post_type === 'notice'
    && ['group', 'group_increase'].includes(data.notice_type)
    && ['increase', 'approve', 'invite'].includes(data.sub_type);
}