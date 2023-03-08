import { setTimeout, clearTimeout } from 'node:timers';
import * as dayjs from 'dayjs';
import type { Cookie } from 'playwright-core';
import { QQProtocol } from '../../../../QQBotModals/ModalTypes';
import parser, { type ParserResult } from '../../../parser';
import * as CQ from '../../../parser/CQ';
import type { UserScriptRendedData, UserItem1, UserItem2, UserDataItem } from '../../../../qq.types';

/* 抖音 */
let userId: string;                                    // 用户userId
let description: string;                               // 描述
let protocol: QQProtocol;                              // 协议：mirai或者oicq
let lastUpdateTime: number | 0 | null = null;          // 记录最新发布视频的更新时间，为0表示当前没有数据，null表示请求数据失败了
let douyinTimer: NodeJS.Timer | undefined = undefined; // 轮询定时器
let browserExecutablePath: string;                     // 浏览器路径
let port: number;                                      // 端口号
let intervalTime: number = 180_000;                    // 轮询间隔
let cookieCache: Array<Cookie> = [];                   // cookie

/* 调试 */
let _isSendDebugMessage: boolean = false; // 是否发送调试信息
let _debugTimes: number = 0;              // 调试次数
const _startTime: string = dayjs().format('YYYY-MM-DD HH:mm:ss');

interface DouyinSendMsg {
  url: string | undefined;
  time: string;
  desc: string;
  nickname: string;
  cover: string;
}

function QQSendGroup(item: DouyinSendMsg): string {
  const sendMessageGroup: Array<string> = [
    `${ item.nickname } 在${ item.time }发送了一条抖音：${ item.desc }`,
    CQ.image(item.cover)
  ];

  item.url && sendMessageGroup.push(`视频下载地址：${ item.url }`);

  return sendMessageGroup.join('');
}

/* 获取数据 */
async function getDouyinData(): Promise<UserScriptRendedData | undefined> {
  try {
    const searchParams: URLSearchParams = new URLSearchParams({
      e: encodeURIComponent(browserExecutablePath),
      u: userId
    });
    const uri: string = `http://localhost:${ port }/douyin/renderdata?${ searchParams.toString() }`;

    // 添加超时控制
    const controller: AbortController = new AbortController();
    let fetchTimeoutTimer: NodeJS.Timer | undefined = setTimeout(() => {
      controller.abort();
      fetchTimeoutTimer = undefined;
    }, 90_000);

    const res: Response = await fetch(uri, {
      method: 'POST',
      signal: controller.signal,
      body: JSON.stringify({
        e: browserExecutablePath,
        u: userId,
        c: cookieCache.map((c: Cookie): string => `${ c.name }=${ c.value }`).join(';')
      })
    });

    fetchTimeoutTimer && clearTimeout(fetchTimeoutTimer);

    if (res.status === 200) {
      const resData: { data: UserScriptRendedData | null; cookie: Array<Cookie> } = await res.json();
      const renderDataJson: UserScriptRendedData | null = resData.data;

      // 合并cookie
      const addNewCookie: Array<Cookie> = [];

      resData.cookie.forEach((cookie: Cookie): void => {
        const index: number = cookieCache.findIndex((o: Cookie): boolean => o.name === cookie.name);

        if (index >= 0) {
          cookieCache[index] = cookie;
        } else {
          addNewCookie.push(cookie);
        }
      });

      resData.cookie.push(...addNewCookie);

      return renderDataJson ?? undefined;
    }
  } catch (err) {
    console.error(err);
  }
}

/* 抖音监听轮询 */
async function handleDouyinListener(): Promise<void> {
  const $douyinLogSendData: {
    data?: UserScriptRendedData | undefined;
    change?: 1;
  } = {};

  try {
    const renderData: UserScriptRendedData | undefined = await getDouyinData();

    $douyinLogSendData.data = renderData;

    if (renderData) {
      _isSendDebugMessage && (_debugTimes = 0);

      const userItemArray: Array<UserItem1 | UserItem2> = Object.values(renderData);
      const userItem2: UserItem2 | undefined = userItemArray.find(
        (o: UserItem1 | UserItem2): o is UserItem2 => typeof o === 'object' && ('post' in o));

      if (userItem2) {
        const data: Array<UserDataItem> = userItem2.post.data.sort(
          (a: UserDataItem, b: UserDataItem) => b.createTime - a.createTime);

        if (lastUpdateTime === null) {
          lastUpdateTime = data.length ? data[0].createTime : 0;
        }

        if (data.length) {
          const sendGroup: Array<ParserResult> = [];

          for (const item of data) {
            if (item.createTime > lastUpdateTime) {
              const sendData: DouyinSendMsg = {
                url: item.video.playApi === '' ? undefined : `https:${ item.video.playApi }`,
                time: dayjs.unix(item.createTime).format('YYYY-MM-DD HH:mm:ss'),
                desc: item.desc,
                nickname: userItem2.user.user.nickname,
                cover: `https:${ item.video.cover }`
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
            lastUpdateTime = data[0].createTime;
            $douyinLogSendData.change = 1;
          }
        }
      }
    } else {
      const _endTime: string = dayjs().format('YYYY-MM-DD HH:mm:ss');

      console.warn('没有获取到RENDER_DATA。', '--->', description ?? userId, _endTime);

      if (_isSendDebugMessage) {
        _debugTimes++;

        if (_debugTimes > 6) {
          postMessage({
            type: 'message',
            sendGroup: [parser(`[qqtools] Debug info: your Douyin cookie has expired.
UserId: ${ userId }
StartTime: ${ _startTime }
EndTime: ${ _endTime }`, protocol)]
          });
          _debugTimes = 0;
        }
      }
    }
  } catch (err) {
    console.error(err);
  }

  postMessage({
    ...$douyinLogSendData,
    type: 'log',
    time: dayjs().format('YYYY-MM-DD HH:mm:ss')
  });
  douyinTimer = setTimeout(handleDouyinListener, intervalTime);
}

/* 初始化获取抖音的记录位置 */
async function douyinInit(): Promise<void> {
  try {
    const renderData: UserScriptRendedData | undefined = await getDouyinData();

    postMessage({
      type: 'log',
      data: renderData,
      time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      init: 1
    });

    if (renderData) {
      const userItemArray: Array<UserItem1 | UserItem2> = Object.values(renderData);
      const userItem2: UserItem2 | undefined = userItemArray.find(
        (o: UserItem1 | UserItem2): o is UserItem2 => typeof o === 'object' && ('post' in o));

      if (userItem2) {
        const data: Array<UserDataItem> = userItem2.post.data.sort(
          (a: UserDataItem, b: UserDataItem) => b.createTime - a.createTime);

        lastUpdateTime = data.length ? data[0].createTime : 0;
      }
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

addEventListener('message', function(event: MessageEvent) {
  if (event.data.close) {
    try {
      douyinTimer && clearTimeout(douyinTimer);
    } catch { /* noop */ }
  } else if (event.data.type === 'cookie') {
    cookieCache = event.data.cookie;
  } else {
    userId = event.data.userId;
    description = event.data.description;
    protocol = event.data.protocol;
    browserExecutablePath = event.data.executablePath;
    port = event.data.port;
    _isSendDebugMessage = event.data.isSendDebugMessage;
    cookieCache = event.data.cookie;

    if (event.data.intervalTime && event.data.intervalTime >= 3) {
      intervalTime = event.data.intervalTime * 60 * 1_000;
    }

    douyinInit();
  }
});