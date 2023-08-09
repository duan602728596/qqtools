import { setTimeout, clearTimeout } from 'node:timers';
import * as dayjs from 'dayjs';
import { requestAwemePostV2, requestTtwidCookie, type AwemePostResponse, type AwemeItem } from '@qqtools-api/douyin';
import { QQProtocol } from '../../../../QQBotModals/ModalTypes';
import parser, { type ParserResult } from '../../../parser';
import * as CQ from '../../../parser/CQ';
import { isCloseMessage, type MessageObject } from './messageTypes';
import broadcastName from '../limiting.worker/broadcastName';
import { msToken } from '../../../../../utils/toutiao/signUtils';

/* 抖音 */
let userId: string;                                    // 用户userId
let description: string;                               // 描述
let protocol: QQProtocol;                              // 协议：mirai或者oicq
let lastUpdateTime: number | 0 | null = null;          // 记录最新发布视频的更新时间，为0表示当前没有数据，null表示请求数据失败了
let douyinTimer: NodeJS.Timer | undefined = undefined; // 轮询定时器
let cookieString: string | undefined = undefined;
let intervalTime: number = 10 * 60 * 1_000;            // 轮询间隔

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

/* 限流等待 */
function waitLimiting(id: string): Promise<void> {
  let broadcastChannel: BroadcastChannel | undefined = new BroadcastChannel(broadcastName);

  return new Promise((resolve: Function, reject: Function): void => {
    function handleListeningMessage(event: MessageEvent<{ id: string; t: number }>): void {
      if (event.data.id === id) {
        resolve();
        broadcastChannel!.removeEventListener('message', handleListeningMessage);
        broadcastChannel = undefined;
      }
    }

    broadcastChannel!.addEventListener('message', handleListeningMessage);
    broadcastChannel!.postMessage({ id });
  });
}

/* 创建cookie */
async function getCookie(): Promise<string> {
  const cookie: string = await requestTtwidCookie();
  const passportCsrfToken: string = msToken(32);

  return [
    (cookieString && !/^\s$/.test(cookieString)) ? cookieString.replace(/;+\s*$/g, '') : undefined,
    cookie,
    'passport_csrf_token=' + passportCsrfToken,
    'passport_csrf_token_default=' + passportCsrfToken
  ].filter((o: string | undefined): boolean => typeof o === 'string').join('; ');
}

/* 获取解析html和接口获取数据 */
async function getDouyinDataByApi(wait: boolean = true): Promise<AwemePostResponse | undefined> {
  try {
    wait && await waitLimiting(msToken(10));

    const res: AwemePostResponse | string = await requestAwemePostV2(await getCookie(), userId);

    // res可能返回string，表示请求失败了
    if (typeof res === 'object') {
      return res;
    }
  } catch (err) {
    console.error(err);
  }
}

/* 抖音监听轮询 */
async function handleDouyinListener(): Promise<void> {
  try {
    const renderData: AwemePostResponse | undefined = await getDouyinDataByApi();

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

      console.warn('[抖音]没有获取到RENDER_DATA。', '--->', description ?? userId, _endTime);

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
    const renderData: AwemePostResponse | undefined = await getDouyinDataByApi(false);

    if (renderData) {
      const data: Array<AwemeItem> = renderData.aweme_list.sort(
        (a: AwemeItem, b: AwemeItem): number => b.create_time - a.create_time);

      lastUpdateTime = data.length ? data[0].create_time : 0;
    } else {
      console.warn('[抖音]初始化时没有获取到RENDER_DATA。', '--->', description ?? userId,
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
  } else {
    userId = event.data.userId;
    description = event.data.description;
    protocol = event.data.protocol;
    cookieString = event.data.cookieString;
    _isSendDebugMessage = event.data.isSendDebugMessage;

    if (event.data.intervalTime && event.data.intervalTime >= 10) {
      intervalTime = event.data.intervalTime * 60 * 1_000;
    }

    douyinInit();
  }
});