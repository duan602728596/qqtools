import { plain, image, at, atAll } from './messageData';
import type { MessageChain } from './qq.types';

interface ParsingResult {
  type: 'Plain' | 'Other';
  text: string;
}

interface Options {
  qqNumber?: number;
}

/**
 * 定义template模板，解析文字
 * 规则为<%= qqtools:type, xxxxxxx %>
 * type: image，解析为图片 <%= qqtools:image, https://example.com/1.jpg %>
 *       at，at人 <%= qqtools:at %>
 *       atAll，at全体成员 <%= qqtools:atAll %>
 * @param { string } message: 信息
 * @param { Options } options: 配置
 * @return { Array<MessageChain> }
 */
function miraiTemplate(message: string, options: Options = {}): Array<MessageChain> {
  const msgArr: Array<string> = message.split(''); // 将字符串拆分成一个一个文字的数组
  const result: Array<ParsingResult> = [];
  let cache: string = '';                // 文本缓冲区
  let type: 'Plain' | 'Other' = 'Plain'; // Plain 正常的文字，Other 其他类型

  // 将文字解析成数组
  for (let i: number = 0, j: number = msgArr.length, k: number = j - 1; i < j; i++) {
    const item: string = msgArr[i]; // 当前字符串

    if (item === '<') {
      // 解析占位符开始
      // 判断下一个是不是%，下下一个是不是=，不是的话，解析为正常的text
      if (i + 2 < j && msgArr[i + 1] === '%' && msgArr[i + 2] === '=') {
        result.push({ type, text: cache }); // 将之前解析的文字保存为Plain
        type = 'Other';                     // 解析Other类型，之后统一处理
        cache = item;                       // 清空文本缓冲区
      } else {
        cache += item;
      }
    } else if (item === '>') {
      // 解析占位符结束
      // 当遇到>时，判断上一个是不是%，不是的话，解析为正常的text
      if (msgArr[i - 1] === '%' && type === 'Other') {
        cache += item;                      // 添加到文本缓冲区
        result.push({ type, text: cache }); // 将之前解析的文字保存为Other
        type = 'Plain';                     // 重置状态
        cache = '';
      } else {
        cache += item;
      }
    } else if (i === k) {
      cache += item;                      // 也可能是最后一位，进行处理
      result.push({ type, text: cache }); // 保存为Plain
    } else {
      cache += item;
    }
  }

  // 解析数组内的Other类型，不满足条件的将会变成Plain类型
  const textResult: Array<MessageChain> = [];

  for (const item of result) {
    // 解析other类型
    if (item.type === 'Other') {
      const formatStrArr: Array<string> = item.text
        .replace(/<%=\s*qqtools\s*:\s*/, '') // 移出左侧的标记符
        .replace(/\s*%>/, '')                // 移出右侧的标记符
        .split(',');                                        // 拆分类型和值
      const [type, ...other]: string[] = formatStrArr;                // 拆分出类型和值
      const qqtoolsType: string = type.toLocaleUpperCase();           // 全部转换成大写
      const otherStr: string = other.join('').trim();                 // 合并值

      if (qqtoolsType === 'IMAGE') {
        // 解析成图片
        textResult.push(image(otherStr));
      } else if (qqtoolsType === 'AT') {
        // 解析成at
        const target: number = (otherStr && /^[0-9]+$/.test(otherStr))
          ? Number(otherStr)
          : options.qqNumber ?? 0;

        textResult.push(at(target));
      } else if (qqtoolsType === 'ATALL') {
        // 解析成atAll
        textResult.push(atAll());
      }

      continue;
    }

    // 正常的文本
    if (item.type === 'Plain' && item.text !== '') {
      textResult.push(plain(item.text));
    }
  }

  return textResult;
}

export default miraiTemplate;