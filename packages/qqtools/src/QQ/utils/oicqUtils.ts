import type { GroupMessage, MemberIncreaseEvent } from 'oicq';
import type { MemberIncreaseEvent as GoCQHttpMemberIncreaseEvent, HeartbeatMessage } from '../QQBotModals/GoCQHttp';
import type { MiraiMessageProps } from '../parser/mirai';

/* 将mirai的数据格式转换成oicq的数据格式 */
export function miraiMessageTooicqMessage(miraiMessage: Array<MiraiMessageProps>): string {
  const oicqMessage: Array<string> = [];

  for (const item of miraiMessage) {
    switch (item.type) {
      case 'Plain':
        oicqMessage.push(item.text);
        break;

      case 'Image':
        oicqMessage.push(`[CQ:image,file=${ item['url'] ?? item['path'] }]`);
        break;

      case 'At':
        oicqMessage.push(`[CQ:at,qq=${ item.target }]`);
        break;

      case 'AtAll':
        oicqMessage.push('[CQ:at,qq=all]');
        break;
    }
  }

  return oicqMessage.join('');
}

type QQModalsMessage = GroupMessage | MemberIncreaseEvent | GoCQHttpMemberIncreaseEvent | HeartbeatMessage;

/* 判断为群信息 */
export function isGroupMessageEventData(data: QQModalsMessage): data is GroupMessage {
  return data.post_type === 'message' && data.message_type === 'group';
}

/* 判断为有人入群 */
export function isMemberIncreaseEventData(data: QQModalsMessage): data is (MemberIncreaseEvent | GoCQHttpMemberIncreaseEvent) {
  return data.post_type === 'notice'
    && ['group', 'group_increase'].includes(data.notice_type)
    && ['increase', 'approve', 'invite'].includes(data.sub_type);
}