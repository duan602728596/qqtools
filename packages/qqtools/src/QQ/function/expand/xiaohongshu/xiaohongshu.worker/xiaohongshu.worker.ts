import { setTimeout, clearTimeout } from 'node:timers';
import * as fs from 'node:fs';
import * as fse from 'fs-extra';
import * as dayjs from 'dayjs';
import { QQProtocol } from '../../../../QQBotModals/ModalTypes';
import parser, { type ParserResult } from '../../../parser';
import * as CQ from '../../../parser/CQ';
import { isCloseMessage, type MessageObject, type BaseInitMessage, type JsonCache, type MergeData } from './messageTypes';
import { getCookie } from '../../../../sdk/xiaohongshu/XiaoHongShuNode';
import { requestUserPosted, requestFeed } from '../../../../services/xiaohongshu';
import type { UserPostedResponse, NoteFeedResponse, PostedNoteItem, FeedNodeCard } from '../../../../services/interface';

/* 小红书 */
let userId: string;
let cacheFile: string;
let executablePath: string;
let cookieString: string;
let cookieStringNumber: number = 0;
let protocol: QQProtocol; // 协议
let lastUpdateTime: number | 0 | null = null; // 记录最新发布的更新时间，为0表示当前没有数据，null表示请求数据失败了
const intervalTime: number = 5 * 60 * 1_000;  // 轮询间隔
let xiaohongshuTimer: NodeJS.Timer | undefined = undefined; // 轮询定时器

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

/* 发送数据 */
function QQSendGroup(item: Required<MergeData>): string {
  const sendMessageGroup: Array<string> = [
    `${ item.card.user.nickname } 在${
      dayjs(item.card.time).format('YYYY-MM-DD HH:mm:ss')
    }发送了一条小红书：${ item.card.title }`
  ];

  sendMessageGroup.push(CQ.image(item.cover.url));
  item.card.video && sendMessageGroup.push(`视频下载地址：${
    item.card.video.media.stream.h264[0].master_url
  }`);

  return sendMessageGroup.join('');
}

/* 获取详细信息 */
async function getFeed(sourceNoteId: string): Promise<FeedNodeCard | undefined> {
  const res: NoteFeedResponse = await requestFeed(sourceNoteId, cookieString, executablePath, userId);

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
    // 重新获取cookie
    if (cookieStringNumber > 24 * 12) {
      cookieString = await getCookie(executablePath);
      cookieStringNumber = 0;
    }

    const userPostedRes: UserPostedResponse = await requestUserPosted(userId, cookieString, executablePath);

    if (userPostedRes.success) {
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
              sendGroup.push(parser(QQSendGroup(item as Required<MergeData>), protocol));
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
    }
  } catch (err) {
    console.error(err);
  }

  cookieStringNumber++;
  xiaohongshuTimer = setTimeout(xiaohongshuListener, intervalTime);
}

/* 初始化小红书 */
async function xiaohongshuInit(): Promise<void> {
  try {
    cookieString = await getCookie(executablePath);
    console.log(`小红书Cookie获取成功：${ cookieString }`);

    const userPostedRes: UserPostedResponse = await requestUserPosted(userId, cookieString, executablePath);

    if (userPostedRes.success) {
      const data: Array<PostedNoteItem> = userPostedRes.data.notes ?? [];

      if (data.length) {
        const { mergeData, everyHasTime }: GetMergeDataReturn = await getMergeData(data);

        if (everyHasTime) {
          lastUpdateTime = mergeData[0].card!.time;
        }
      } else {
        lastUpdateTime = 0;
      }
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
  } else {
    const {
      userId: userId1,
      cacheFile: cacheFile1,
      executablePath: executablePath1,
      protocol: protocol1
    }: BaseInitMessage = event.data;

    userId = userId1;
    cacheFile = cacheFile1;
    executablePath = executablePath1;
    protocol = protocol1;
    xiaohongshuInit();
  }
});