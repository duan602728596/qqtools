import { setTimeout, clearTimeout } from 'node:timers';
import {
  chromium,
  type Browser,
  type ChromiumBrowserContext,
  type Page,
  type JSHandle
} from 'playwright-core';
import * as dayjs from 'dayjs';
import type * as oicq from 'oicq';
import { plain } from '../miraiUtils';
import type { UserScriptRendedData, UserItem1, UserItem2, UserDataItem, MessageChain } from '../../qq.types';

let browser: Browser | undefined = undefined;
let context: ChromiumBrowserContext | undefined = undefined;
let page: Page | undefined = undefined;
let closePageTimer: NodeJS.Timer | undefined = undefined;
let userId: string;
let protocol: string; // 协议：mirai或者oicq
let id: string; // 记录查询位置
let nickname: string | undefined;
let douyinTimer: NodeJS.Timer | undefined = undefined;

interface DouyinSendMsg {
  url: string;
  time: string;
  desc: string;
}

/* mirai的消息 */
function miraiSendGroup(item: DouyinSendMsg): Array<MessageChain> {
  const sendGroup: Array<MessageChain> = [];

  sendGroup.push(
    plain(`${ nickname } 在${ item.time }发送了一条抖音：${ item.desc }
视频下载地址：${ item.url }`)
  );

  return sendGroup;
}

/* oicq的消息 */
function oicqSendGroup(item: DouyinSendMsg): string {
  let sendText: string = '';

  sendText += `${ nickname } 在${ item.time }发送了一条抖音：${ item.desc }
视频下载地址：${ item.url }`;

  return sendText;
}

/* 获取数据 */
async function getDouyinData(): Promise<UserScriptRendedData | void> {
  if (!(browser && context)) {
    browser = await chromium.launch({
      headless: true,
      executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
      timeout: 0
    });
    context = await browser.newContext({
      ignoreHTTPSErrors: true,
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) '
        + 'Chrome/109.0.0.0 Safari/537.36 Edg/109.0.1518.52'
    });
    console.log('无头浏览器启动成功！', userId);
  }

  try {
    page = await context.newPage();
    await page.goto(`https://www.douyin.com/user/${ userId }`);
    await page.locator('#RENDER_DATA');

    closePageTimer = setTimeout((): void => {
      page && page.close();

      if (closePageTimer !== undefined) {
        clearTimeout(closePageTimer);
        closePageTimer = undefined;
      }
    }, 300_000);

    const renderDataHandle: JSHandle = await page.evaluateHandle(
      (): string => document.getElementById('RENDER_DATA')!.innerHTML);
    const renderData: string = await renderDataHandle.evaluate(
      (node: string): string => decodeURIComponent(node));
    const renderDataJson: UserScriptRendedData = JSON.parse(renderData);

    await page.close();
    page = undefined;

    if (closePageTimer !== undefined) {
      clearTimeout(closePageTimer);
      closePageTimer = undefined;
    }

    return renderDataJson;
  } catch (err) {
    console.error(err);
  }
}

/* 抖音监听轮询 */
async function handleDouyinListener(): Promise<void> {
  try {
    const renderData: UserScriptRendedData | void = await getDouyinData();

    if (!renderData) return;

    const userItemArray: Array<UserItem1 | UserItem2 | string> = Object.values(renderData);
    const userItem2: UserItem2 | undefined = userItemArray.find(
      (o: UserItem1 | UserItem2 | string): o is UserItem2 => typeof o === 'object' && ('post' in o));

    if (userItem2) {
      const data: Array<UserDataItem> = userItem2.post.data.sort(
        (a: UserDataItem, b: UserDataItem) => b.createTime - a.createTime);

      if (data.length && data[0].awemeId !== id) {
        const sendData: DouyinSendMsg = {
          url: `https:${ data[0].video.playApi }`,
          time: dayjs.unix(data[0].createTime).format('YYYY-MM-DD HH:mm:ss'),
          desc: data[0].desc
        };

        postMessage({
          sendGroup: protocol === 'oicq' ? oicqSendGroup(sendData) : miraiSendGroup(sendData)
        });
        id = data[0].awemeId;
      }
    }
  } catch (err) {
    console.error(err);
  }

  douyinTimer = setTimeout(handleDouyinListener, 150_000);
}

/* 初始化获取抖音的记录位置 */
async function douyinInit(): Promise<void> {
  try {
    const renderData: UserScriptRendedData | void = await getDouyinData();

    if (!renderData) return;

    const userItemArray: Array<UserItem1 | UserItem2 | string> = Object.values(renderData);
    const userItem2: UserItem2 | undefined = userItemArray.find(
      (o: UserItem1 | UserItem2 | string): o is UserItem2 => typeof o === 'object' && ('post' in o));

    if (userItem2) {
      nickname = userItem2.user.user.nickname;

      const data: Array<UserDataItem> = userItem2.post.data.sort(
        (a: UserDataItem, b: UserDataItem) => b.createTime - a.createTime);

      id = data.length ? data[0].awemeId : '0';
      douyinTimer = setTimeout(handleDouyinListener, 150_000);
    }
  } catch (err) {
    console.error(err);
  }
}

addEventListener('message', function(event: MessageEvent) {
  if (event.data.close) {
    try {
      douyinTimer && clearTimeout(douyinTimer);
      browser && browser.close();
    } catch { /* noop */ }
  } else {
    userId = event.data.userId;
    protocol = event.data.protocol;
    douyinInit();
  }
});