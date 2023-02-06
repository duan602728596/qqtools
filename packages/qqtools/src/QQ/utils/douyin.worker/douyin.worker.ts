import { setTimeout, clearTimeout } from 'node:timers';
import {
  chromium,
  type Browser,
  type ChromiumBrowserContext,
  type Page,
  type JSHandle,
  type Route
} from 'playwright-core';
import * as dayjs from 'dayjs';
import type * as oicq from 'oicq';
import { plain } from '../miraiUtils';
import type { UserScriptRendedData, UserItem1, UserItem2, UserDataItem, MessageChain } from '../../qq.types';

/* playwright相关 */
let browser: Browser | undefined = undefined;                // 浏览器browser
let context: ChromiumBrowserContext | undefined = undefined; // 浏览器上下文context
let page: Page | undefined = undefined;                      // 浏览器页面page
let closePageTimer: NodeJS.Timer | undefined = undefined;    // 监听并关闭page

/* 抖音 */
let userId: string;                                    // 用户userId
let protocol: string;                                  // 协议：mirai或者oicq
let id: string | '0' | null = null;                    // 记录查询位置，为0表示当前没有数据，和null不同，null表示请求数据失败了
let douyinTimer: NodeJS.Timer | undefined = undefined; // 轮询定时器
let executablePath: string;                            // 浏览器路径

interface DouyinSendMsg {
  url: string;
  time: string;
  desc: string;
  nickname: string;
}

/* mirai的消息 */
function miraiSendGroup(item: DouyinSendMsg): Array<MessageChain> {
  const sendGroup: Array<MessageChain> = [];

  sendGroup.push(
    plain(`${ item.nickname } 在${ item.time }发送了一条抖音：${ item.desc }
视频下载地址：${ item.url }`)
  );

  return sendGroup;
}

/* oicq的消息 */
function oicqSendGroup(item: DouyinSendMsg): string {
  let sendText: string = '';

  sendText += `${ item.nickname } 在${ item.time }发送了一条抖音：${ item.desc }
视频下载地址：${ item.url }`;

  return sendText;
}

/* 获取数据 */
async function getDouyinData(): Promise<UserScriptRendedData | void> {
  if (!(browser && context)) {
    browser = await chromium.launch({
      headless: true,
      executablePath,
      timeout: 0
    });
    context = await browser.newContext({
      ignoreHTTPSErrors: true,
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) '
        + 'Chrome/109.0.0.0 Safari/537.36 Edg/109.0.1518.52',
      serviceWorkers: 'block'
    });
    console.log('无头浏览器启动成功！', userId);
  }

  try {
    page = await context.newPage();

    await page.route((url: URL): boolean => !/^\/user\//i.test(url.pathname), (route: Route) => route.abort());
    await page.goto(`https://www.douyin.com/user/${ userId }`);
    await page.locator('#RENDER_DATA');

    closePageTimer = setTimeout((): void => {
      page && page.close();

      if (closePageTimer !== undefined) {
        clearTimeout(closePageTimer);
        closePageTimer = undefined;
      }
    }, 90_000);

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

    if (!renderData) return console.warn('没有获取到RENDER_DATA。', userId, dayjs().format('YYYY-MM-DD HH:mm:ss'));

    const userItemArray: Array<UserItem1 | UserItem2> = Object.values(renderData);
    const userItem2: UserItem2 | undefined = userItemArray.find((o: UserItem1 | UserItem2): o is UserItem2 => typeof o === 'object' && ('post' in o));

    if (userItem2) {
      const data: Array<UserDataItem> = userItem2.post.data.sort(
        (a: UserDataItem, b: UserDataItem) => b.createTime - a.createTime);

      if (id === null) {
        id = data.length ? data[0].awemeId : '0';
      }

      if (data.length && data[0].awemeId !== id && id !== null) {
        const sendData: DouyinSendMsg = {
          url: `https:${ data[0].video.playApi }`,
          time: dayjs.unix(data[0].createTime).format('YYYY-MM-DD HH:mm:ss'),
          desc: data[0].desc,
          nickname: userItem2.user.user.nickname
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

  douyinTimer = setTimeout(handleDouyinListener, 180_000);
}

/* 初始化获取抖音的记录位置 */
async function douyinInit(): Promise<void> {
  try {
    const renderData: UserScriptRendedData | void = await getDouyinData();

    if (!renderData) return console.warn('初始化时没有获取到RENDER_DATA。', userId, dayjs().format('YYYY-MM-DD HH:mm:ss'));

    const userItemArray: Array<UserItem1 | UserItem2> = Object.values(renderData);
    const userItem2: UserItem2 | undefined = userItemArray.find((o: UserItem1 | UserItem2): o is UserItem2 => typeof o === 'object' && ('post' in o));

    if (userItem2) {
      const data: Array<UserDataItem> = userItem2.post.data.sort(
        (a: UserDataItem, b: UserDataItem) => b.createTime - a.createTime);

      id = data.length ? data[0].awemeId : '0';
    }
  } catch (err) {
    console.error(err);
  }

  douyinTimer = setTimeout(handleDouyinListener, 180_000);
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
    executablePath = event.data.executablePath;
    douyinInit();
  }
});