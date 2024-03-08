import type { Sendable } from 'icqq';
import type { ParserResult } from '../../QQ/function/parser';

/**
 * 发送群消息
 * @param { number } groupNumber - 群号
 * @param { string } socketHost
 * @param { number } port - 端口号
 * @param { string } message - 发送信息
 */
export async function requestSendGroupMessage(
  groupNumber: number,
  socketHost: string,
  port: number,
  message: ParserResult | Sendable
): Promise<unknown> {
  const res: Response = await fetch(`http://${ socketHost }:${ port }/oicq/action`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      type: 'sendGroupMsg',
      payload: [groupNumber, message]
    })
  });

  return await res.json();
}