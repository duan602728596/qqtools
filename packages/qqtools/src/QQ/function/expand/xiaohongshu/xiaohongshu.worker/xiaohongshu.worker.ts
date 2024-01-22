import { setTimeout, clearTimeout } from 'node:timers';
import * as fs from 'node:fs';
import * as fse from 'fs-extra';
import * as dayjs from 'dayjs';
import {
  requestUserPosted,
  requestFeed,
  type UserPostedResponse,
  type NoteFeedResponse,
  type PostedNoteItem,
  type FeedNodeCard
} from '@qqtools-api/xiaohongshu';
import { QQProtocol } from '../../../../QQBotModals/ModalTypes';
import parser, { type ParserResult } from '../../../parser';
import * as CQ from '../../../parser/CQ';
import {
  isCloseMessage,
  isSignMessage,
  isImageToBase64Message,
  isRequestHtmlMessage,
  XHSProtocol,
  type MessageObject,
  type BaseInitMessage,
  type JsonCache,
  type MergeData
} from './messageTypes';
import { _xiaohongshuLogProtocol } from '../../../../../utils/logProtocol/logActions';
import type { _UserPostedObject } from '../../../../../../../main/src/logProtocol/logTemplate/xiaohongshu.mjs';

/* 小红书 */
let userId: string;
let description: string;
let cacheFile: string;
let cookieString: string;
let port: number;
let protocol: QQProtocol; // 协议
let signProtocol: XHSProtocol;
let lastUpdateTime: number | 0 | null = null; // 记录最新发布的更新时间，为0表示当前没有数据，null表示请求数据失败了
const intervalTime: number = 5 * 60 * 1_000;  // 轮询间隔
let xiaohongshuTimer: NodeJS.Timeout | undefined = undefined; // 轮询定时器

/* 调试 */
const _startTime: string = dayjs().format('YYYY-MM-DD HH:mm:ss');
let _isSendDebugMessage: boolean = false;     // 是否发送调试信息
let _debugTimes: number = 0;                  // 调试次数
let _sendedXiaohongshuDebugInfo: boolean = false;

/* 从cache中获取缓存 */
function readCache(): Promise<JsonCache> {
  if (fs.existsSync(cacheFile)) {
    return fse.readJSON(cacheFile);
  } else {
    return Promise.resolve({ cache: {} });
  }
}

/* 写入缓存 */
function writeCache(json: JsonCache): Promise<void> {
  return fse.writeJson(cacheFile, json);
}

function imageToBase64(imageUrl: string): Promise<string> {
  const id: string = `${ Math.random() }`;

  return new Promise((resolve: Function, reject: Function): void => {
    function handleSignMessage(event: MessageEvent<MessageObject>): void {
      if (isImageToBase64Message(event.data) && id === event.data.id) {
        removeEventListener('message', handleSignMessage);
        resolve(event.data.result.replace('data:image/png;base64,', ''));
      }
    }

    addEventListener('message', handleSignMessage);
    postMessage({ id, imageUrl, type: 'imageToBase64' });
  });
}

function requestHtml(): Promise<UserPostedResponse | undefined> {
  const id: string = `${ Math.random() }`;

  return new Promise((resolve: Function, reject: Function): void => {
    function handleSignMessage(event: MessageEvent<MessageObject>): void {
      if (isRequestHtmlMessage(event.data) && id === event.data.id) {
        removeEventListener('message', handleSignMessage);
        _xiaohongshuLogProtocol.post<_UserPostedObject>('userPosted', {
          userId,
          response: JSON.stringify(event.data.result, null, 2)
        });
        resolve(event.data.result);
      }
    }

    addEventListener('message', handleSignMessage);
    postMessage({ id, url: `https://www.xiaohongshu.com/user/profile/${ userId }`, type: 'requestHtml' });
  });
}

/* 发送数据 */
async function QQSendGroup(item: Required<MergeData>): Promise<string> {
  const sendMessageGroup: Array<string> = [
    `${ item.card.user.nickname } 在${
      dayjs(item.card.time).format('YYYY-MM-DD HH:mm:ss')
    }发送了一条小红书：${ item.card.title }`
  ];

  if (protocol === QQProtocol.Mirai) {
    sendMessageGroup.push(CQ.image(`base64://${ await imageToBase64(item.cover.url) }`));
  } else {
    sendMessageGroup.push(CQ.image(item.cover.url));
  }

  item.card.video && sendMessageGroup.push(`视频下载地址：${
    item.card.video.media.stream.h264[0].master_url
  }`);

  return sendMessageGroup.join('');
}

/* 获取详细信息 */
async function getFeed(sourceNoteId: string): Promise<FeedNodeCard | undefined> {
  const res: NoteFeedResponse = await requestFeed(sourceNoteId, cookieString, signProtocol, port, userId);

  if (res.success) {
    return res.data.items?.[0].note_card;
  }
}

/**
 * 格式化数据
 * @param { Array<PostedNoteItem> } data: 小红书列表
 * @param { Array<FeedNodeCard | undefined> } feeds: 列表item对应的feed
 * @param { JsonCache } cache: 小红书缓存
 */
async function formatToMergeData(data: PostedNoteItem[], feeds: (FeedNodeCard | undefined)[], cache: JsonCache): Promise<MergeData[]> {
  const nextData: Array<MergeData> = [];

  data.forEach((item: PostedNoteItem, index: number): void => {
    const nextItem: MergeData = {
      noteId: item.note_id,
      cover: {
        url: item.cover.url
      },
      type: item.type
    };
    const feedItem: FeedNodeCard | undefined = feeds[index];

    if (feedItem) {
      nextItem.card = {
        time: feedItem.time,
        title: feedItem.title,
        type: feedItem.type,
        user: {
          avatar: feedItem.user.avatar,
          nickname: feedItem.user.nickname
        }
      };

      if (feedItem.video) {
        nextItem.card.video = {
          media: {
            stream: {
              h264: [{ master_url: feedItem.video.media.stream.h264[0].master_url }]
            }
          }
        };
      }

      cache.cache[item.note_id] = nextItem.card;
    }

    nextData.push(nextItem);
  });

  await writeCache(cache);

  return nextData;
}

/* 获取和格式化数据 */
type GetMergeDataReturn = { mergeData: Array<MergeData>; everyHasTime: boolean };

/**
 * @param { Array<PostedNoteItem> } data: 获取到的列表
 */
async function getMergeData(data: Array<PostedNoteItem>): Promise<GetMergeDataReturn> {
  const cache: JsonCache = await readCache();
  const feeds: Array<FeedNodeCard | undefined> = [];

  for (const item of data) {
    if (item.note_id in cache.cache) {
      feeds.push(cache.cache[item.note_id]);
    } else {
      feeds.push(await getFeed(item.note_id));
    }
  }

  const mergeData: Array<MergeData> = await formatToMergeData(data, feeds, cache); // 请求完数据后格式化数据
  const everyHasTime: boolean = mergeData.every((o: MergeData): boolean => !!o.card?.time);

  if (everyHasTime) mergeData.sort((a: MergeData, b: MergeData): number => b.card!.time - a.card!.time);

  return { mergeData, everyHasTime };
}

/* 小红书轮询 */
async function xiaohongshuListener(): Promise<void> {
  try {
    const userPostedRes: UserPostedResponse = await requestUserPosted(userId, cookieString, signProtocol, port);

    if (userPostedRes && userPostedRes.success) {
      _isSendDebugMessage && (_debugTimes = 0);

      const data: Array<PostedNoteItem> = userPostedRes.data.notes ?? [];

      if (data.length) {
        const { mergeData, everyHasTime }: GetMergeDataReturn = await getMergeData(data);

        if (everyHasTime) {
          if (lastUpdateTime === null) {
            lastUpdateTime = mergeData[0].card!.time;
          }

          const sendGroup: Array<ParserResult> = [];

          for (const item of mergeData) {
            if (item.card!.time > lastUpdateTime) {
              sendGroup.push(parser({
                text: await QQSendGroup(item as Required<MergeData>),
                protocol
              }));
            } else {
              break;
            }
          }

          if (sendGroup.length) {
            postMessage({
              type: 'message',
              sendGroup
            });
            lastUpdateTime = mergeData[0].card!.time;
          }
        }
      }
    } else {
      const _endTime: string = dayjs().format('YYYY-MM-DD HH:mm:ss');

      console.warn('[小红书]没有获取到UserPostedResponse。', '--->', description ?? userId, _endTime);

      if (_isSendDebugMessage) {
        _debugTimes++;

        if (_debugTimes > 6 && !_sendedXiaohongshuDebugInfo) {
          postMessage({
            type: 'message',
            sendGroup: [parser({
              text: `[qqtools] Debug info: your Xiaohongshu cookie has expired.
UserId: ${ userId }
StartTime: ${ _startTime }
EndTime: ${ _endTime }`,
              protocol
            })]
          });
          _sendedXiaohongshuDebugInfo = true;
        }
      }
    }
  } catch (err) {
    console.error(err);
  }

  xiaohongshuTimer = setTimeout(xiaohongshuListener, intervalTime);
}

/* 初始化小红书 */
async function xiaohongshuInit(): Promise<void> {
  try {
    const userPostedRes: UserPostedResponse = await requestUserPosted(userId, cookieString, signProtocol, port);

    if (userPostedRes && userPostedRes.success) {
      const data: Array<PostedNoteItem> = userPostedRes.data.notes ?? [];

      if (data.length) {
        const { mergeData, everyHasTime }: GetMergeDataReturn = await getMergeData(data);

        if (everyHasTime) {
          lastUpdateTime = mergeData[0].card!.time;
        }
      } else {
        lastUpdateTime = 0;
      }
    } else {
      console.warn('[小红书]初始化时没有获取到UserPostedResponse。', '--->', description ?? userId,
        dayjs().format('YYYY-MM-DD HH:mm:ss'));
      _isSendDebugMessage && _debugTimes++;
    }
  } catch (err) {
    console.error(err);
  }

  xiaohongshuTimer = setTimeout(xiaohongshuListener, intervalTime);
}

addEventListener('message', function(event: MessageEvent<MessageObject>): void {
  if (isCloseMessage(event.data)) {
    try {
      xiaohongshuTimer && clearTimeout(xiaohongshuTimer);
    } catch { /* noop */ }
  } else if (isSignMessage(event.data) || isImageToBase64Message(event.data) || isRequestHtmlMessage(event.data)) {
    /* noop */
  } else {
    const {
      userId: userId1,
      cacheFile: cacheFile1,
      protocol: protocol1,
      signProtocol: signProtocol1,
      description: description1,
      cookieString: cookieString1,
      port: port1,
      isSendDebugMessage
    }: BaseInitMessage = event.data;

    userId = userId1;
    cacheFile = cacheFile1;
    protocol = protocol1;
    signProtocol = signProtocol1;
    port = port1;
    description = description1;
    cookieString = cookieString1;
    _isSendDebugMessage = !!isSendDebugMessage;
    xiaohongshuInit();
  }
});