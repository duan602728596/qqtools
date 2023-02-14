import { segment, type MessageElem } from 'oicq';
import { QQProtocol } from '../QQBotModals/ModalTypes';
import { plain, face, dice, image, at, atAll, miraiCode, type MiraiMessageProps } from './mirai';
import { miraiTemplate } from '../utils/miraiUtils';

export type ParserResult = Array<MiraiMessageProps> | Array<MessageElem> | string;

/**
 * 消息统一解析
 * @param { string } text: 原始文本
 * @param { QQProtocol } protocol: 协议
 */
function parser(text: string, protocol: QQProtocol): ParserResult {
  // go-cqhttp不处理
  if (protocol === QQProtocol.GoCQHttp) {
    return text;
  }

  // oicq解析
  const message: Array<MessageElem> = segment.fromCqcode(text);

  if (protocol === QQProtocol.Oicq) {
    return message;
  }

  // mirai根据oicq的解析来处理
  const miraiMessageGroup: Array<MiraiMessageProps | MiraiMessageProps[]>
    = message.map((ele: MessageElem): MiraiMessageProps | MiraiMessageProps[] | undefined => {
      switch (ele.type) {
        case 'text':
          return plain(ele.text);

        case 'face':
        case 'sface':
          return face(ele.id);

        case 'rps':
        case 'dice':
          if (ele.id) {
            return dice(ele.id);
          } else break;

        case 'image':
          if (typeof ele.file === 'string') {
            return image(ele.file);
          } else break;

        case 'at':
          if (ele.qq === 'all') {
            return atAll();
          } else {
            return at(ele.qq);
          }

        case 'mirai':
          return plain(ele.data);

        default:
          return plain(JSON.stringify(ele));
      }
    }).filter((o: MiraiMessageProps | MiraiMessageProps[] | void): o is (MiraiMessageProps | MiraiMessageProps[]) => o !== undefined);

  // 兼容旧的qqtools标记
  for (let i: number = 0, j: number = miraiMessageGroup.length; i < j; i++) {
    let item: MiraiMessageProps | MiraiMessageProps[] = miraiMessageGroup[i];

    if (!Array.isArray(item) && (item.type === 'Plain' || item.type === 'MiraiCode')) {
      const itemText: string = item.type === 'MiraiCode' ? item.code : item.text;

      if (/<%=\s*qqtools\s*:/.test(itemText)) {
        item = miraiMessageGroup[i] = miraiTemplate(itemText);
      }

      if (Array.isArray(item)) {
        for (let u: number = 0, t: number = item.length; u < t; u++) {
          const childItem: MiraiMessageProps = item[u];

          if (childItem.type === 'Plain' && /\[mirai\s*:/.test(childItem.text)) {
            miraiMessageGroup[i][u] = miraiCode(childItem.text);
          }
        }
      } else if (/\[mirai\s*:/.test(itemText)) {
        miraiMessageGroup[i] = miraiCode(itemText);
      }
    }
  }

  console.log(miraiMessageGroup);

  return miraiMessageGroup.flat();
}

export default parser;