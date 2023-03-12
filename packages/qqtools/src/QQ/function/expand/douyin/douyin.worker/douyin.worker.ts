import { setTimeout, clearTimeout } from 'node:timers';
import * as dayjs from 'dayjs';
import { QQProtocol } from '../../../../QQBotModals/ModalTypes';
import parser, { type ParserResult } from '../../../parser';
import * as CQ from '../../../parser/CQ';
import { isCloseMessage, isXBogusMessage, type MessageObject } from './messageTypes';
import { requestAwemePost } from '../../../../services/douyin';
import type { AwemePostResponse, AwemeItem } from '../../../../services/interface';

/* 抖音 */
let userId: string;                                    // 用户userId
let webId: string;                                     // 用户webId
let description: string;                               // 描述
let protocol: QQProtocol;                              // 协议：mirai或者oicq
let lastUpdateTime: number | 0 | null = null;          // 记录最新发布视频的更新时间，为0表示当前没有数据，null表示请求数据失败了
let douyinTimer: NodeJS.Timer | undefined = undefined; // 轮询定时器
let port: number;                                      // 端口号
let intervalTime: number = 180_000;                    // 轮询间隔
let cookieString: string;                              // cookie
let XBogusResolveFunction: Function | undefined;       // XBogus resolve function

/* 调试 */
const _startTime: string = dayjs().format('YYYY-MM-DD HH:mm:ss');
let _isSendDebugMessage: boolean = false; // 是否发送调试信息
let _debugTimes: number = 0;              // 调试次数
let _sendedDouyinDebugInfo: boolean = false;

interface DouyinSendMsg {
  url: string | undefined;
  time: string;
  desc: string;
  nickname: string;
  cover?: string;
}

function QQSendGroup(item: DouyinSendMsg): string {
  const sendMessageGroup: Array<string> = [
    `${ item.nickname } 在${ item.time }发送了一条抖音：${ item.desc }${ item.cover ? '\n' : '' }`
  ];

  item.cover && sendMessageGroup.push(CQ.image(item.cover));
  item.url && sendMessageGroup.push(`视频下载地址：${ item.url }`);

  return sendMessageGroup.join('');
}

/* 获取解析html和接口获取数据 */
export async function getDouyinDataByHtmlAndApi(): Promise<AwemePostResponse | undefined> {
  try {
    const XBogus: string = await new Promise((resolve: Function): void => {
      XBogusResolveFunction = resolve;
      postMessage({ type: 'X-Bogus' });
    });
    const res: AwemePostResponse = await requestAwemePost(cookieString, { secUserId: userId, webId }, XBogus);

    return res;
  } catch (err) {
    console.error(err);
  }
}

/* 抖音监听轮询 */
async function handleDouyinListener(): Promise<void> {
  try {
    const renderData: AwemePostResponse | undefined = await getDouyinDataByHtmlAndApi();

    if (renderData) {
      _isSendDebugMessage && (_debugTimes = 0);

      const data: Array<AwemeItem> = renderData.aweme_list.sort(
        (a: AwemeItem, b: AwemeItem): number => b.create_time - a.create_time);

      if (lastUpdateTime === null) {
        lastUpdateTime = data.length ? data[0].create_time : 0;
      }

      if (data.length) {
        const sendGroup: Array<ParserResult> = [];

        for (const item of data) {
          if (item.create_time > lastUpdateTime) {
            const sendData: DouyinSendMsg = {
              url: item?.video?.bit_rate?.length
                ? (item.video.bit_rate[0].play_addr.url_list.find((o: string): boolean => /^https/i.test(o))
                  ?? item.video.bit_rate[0].play_addr.url_list[0])
                : undefined,
              time: dayjs.unix(item.create_time).format('YYYY-MM-DD HH:mm:ss'),
              desc: item.desc,
              nickname: item.author.nickname,
              cover: item.video.cover.url_list[0]
            };

            sendGroup.push(parser(QQSendGroup(sendData), protocol));
          } else {
            break;
          }
        }

        if (sendGroup.length) {
          postMessage({
            type: 'message',
            sendGroup
          });
          lastUpdateTime = data[0].create_time;
        }
      }

      _debugTimes = 0;
    } else {
      const _endTime: string = dayjs().format('YYYY-MM-DD HH:mm:ss');

      console.warn('没有获取到RENDER_DATA。', '--->', description ?? userId, _endTime);

      if (_isSendDebugMessage) {
        _debugTimes++;

        if (_debugTimes > 6 && !_sendedDouyinDebugInfo) {
          postMessage({
            type: 'message',
            sendGroup: [parser(`[qqtools] Debug info: your Douyin cookie has expired.
UserId: ${ userId }
StartTime: ${ _startTime }
EndTime: ${ _endTime }`, protocol)]
          });
          _sendedDouyinDebugInfo = true;
        }
      }
    }
  } catch (err) {
    console.error(err);
  }

  douyinTimer = setTimeout(handleDouyinListener, intervalTime);
}

/* 初始化获取抖音的记录位置 */
async function douyinInit(): Promise<void> {
  try {
    const renderData: AwemePostResponse | undefined = await getDouyinDataByHtmlAndApi();

    if (renderData) {
      const data: Array<AwemeItem> = renderData.aweme_list.sort(
        (a: AwemeItem, b: AwemeItem): number => b.create_time - a.create_time);

      lastUpdateTime = data.length ? data[0].create_time : 0;
    } else {
      console.warn('初始化时没有获取到RENDER_DATA。', '--->', description ?? userId,
        dayjs().format('YYYY-MM-DD HH:mm:ss'));
      _isSendDebugMessage && _debugTimes++;
    }
  } catch (err) {
    console.error(err);
  }

  douyinTimer = setTimeout(handleDouyinListener, intervalTime);
}

addEventListener('message', function(event: MessageEvent<MessageObject>) {
  if (isCloseMessage(event.data)) {
    try {
      douyinTimer && clearTimeout(douyinTimer);
    } catch { /* noop */ }
  } else if (isXBogusMessage(event.data)) {
    XBogusResolveFunction && XBogusResolveFunction(event.data.value);
    XBogusResolveFunction = undefined;
  } else {
    userId = event.data.userId;
    webId = event.data.webId;
    description = event.data.description;
    protocol = event.data.protocol;
    port = event.data.port;
    cookieString = event.data.cookieString;
    _isSendDebugMessage = event.data.isSendDebugMessage;

    if (event.data.intervalTime && event.data.intervalTime >= 3) {
      intervalTime = event.data.intervalTime * 60 * 1_000;
    }

    douyinInit();
  }
});