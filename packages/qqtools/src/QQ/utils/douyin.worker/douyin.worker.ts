import { setTimeout, clearTimeout } from 'node:timers';
import {
  chromium,
  type Browser,
  type ChromiumBrowserContext,
  type Page,
  type JSHandle,
  type Route
} from 'playwright-core';
import * as oicq from 'oicq';
import * as dayjs from 'dayjs';
import { plain, image } from '../miraiUtils';
import type { UserScriptRendedData, UserItem1, UserItem2, UserDataItem, MessageChain } from '../../qq.types';

/* playwright相关 */
let browser: Browser | undefined = undefined;                // 浏览器browser
let context: ChromiumBrowserContext | undefined = undefined; // 浏览器上下文context
let page: Page | undefined = undefined;                      // 浏览器页面page
let closePageTimer: NodeJS.Timer | undefined = undefined;    // 监听并关闭page

/* 抖音 */
let userId: string;                                    // 用户userId
let description: string;                               // 描述
let protocol: string;                                  // 协议：mirai或者oicq
let lastUpdateTime: number | 0 | null = null;          // 记录最新发布视频的更新时间，为0表示当前没有数据，null表示请求数据失败了
let douyinTimer: NodeJS.Timer | undefined = undefined; // 轮询定时器
let executablePath: string;                            // 浏览器路径

interface DouyinSendMsg {
  url: string | undefined;
  time: string;
  desc: string;
  nickname: string;
  cover: string;
}

/* mirai的消息 */
function miraiSendGroup(item: DouyinSendMsg): Array<MessageChain> {
  const sendGroup: Array<MessageChain> = [
    plain(`${ item.nickname } 在${ item.time }发送了一条抖音：${ item.desc }`),
    image(item.cover)
  ];

  item.url && sendGroup.push(plain(`视频下载地址：${ item.url }`));

  return sendGroup;
}

/* oicq的消息 */
function oicqSendGroup(item: DouyinSendMsg): string {
  const sendGroup: Array<string> = [
    `${ item.nickname } 在${ item.time }发送了一条抖音：${ item.desc }`,
    oicq.cqcode.image(item.cover)
  ];

  item.url && sendGroup.push(`视频下载地址：${ item.url }`);

  return sendGroup.join('');
}

/* 获取数据 */
async function getDouyinData(): Promise<UserScriptRendedData | undefined> {
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
    await context.route((url: URL): boolean => !/^\/user\//i.test(url.pathname), (route: Route) => route.abort());
    console.log('无头浏览器启动成功！', '--->', description ?? userId, dayjs().format('YYYY-MM-DD HH:mm:ss'));
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
    }, 90_000);

    const renderDataHandle: JSHandle<string | null> = await page.evaluateHandle((): string | null => {
      const scriptElement: HTMLElement | null = document.getElementById('RENDER_DATA');

      return scriptElement ? scriptElement.innerHTML : null;
    });
    const renderData: string | null = await renderDataHandle.evaluate(
      (node: string | null): string | null => node ? decodeURIComponent(node) : null);
    const renderDataJson: UserScriptRendedData | undefined = renderData ? JSON.parse(renderData) : undefined;

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
  const $douyinLogSendData: {
    data?: UserScriptRendedData | undefined;
    change?: 1;
  } = {};

  try {
    const renderData: UserScriptRendedData | undefined = await getDouyinData();

    $douyinLogSendData.data = renderData;

    if (renderData) {
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
          const sendGroup: Array<MessageChain[] | string> = [];

          for (const item of data) {
            if (item.createTime > lastUpdateTime) {
              const sendData: DouyinSendMsg = {
                url: item.video.playApi === '' ? undefined : `https:${ item.video.playApi }`,
                time: dayjs.unix(item.createTime).format('YYYY-MM-DD HH:mm:ss'),
                desc: item.desc,
                nickname: userItem2.user.user.nickname,
                cover: `https:${ item.video.cover }`
              };

              sendGroup.push(protocol === 'oicq' ? oicqSendGroup(sendData) : miraiSendGroup(sendData));
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
      console.warn('没有获取到RENDER_DATA。', '--->', description ?? userId,
        dayjs().format('YYYY-MM-DD HH:mm:ss'));
    }
  } catch (err) {
    console.error(err);
  }

  postMessage({
    ...$douyinLogSendData,
    type: 'log',
    time: dayjs().format('YYYY-MM-DD HH:mm:ss')
  });
  douyinTimer = setTimeout(handleDouyinListener, 180_000);
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
      const userItem2: UserItem2 | undefined = userItemArray.find((o: UserItem1 | UserItem2): o is UserItem2 => typeof o === 'object' && ('post' in o));

      if (userItem2) {
        const data: Array<UserDataItem> = userItem2.post.data.sort(
          (a: UserDataItem, b: UserDataItem) => b.createTime - a.createTime);

        lastUpdateTime = data.length ? data[0].createTime : 0;
      }
    } else {
      console.warn('初始化时没有获取到RENDER_DATA。', '--->', description ?? userId,
        dayjs().format('YYYY-MM-DD HH:mm:ss'));
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
    description = event.data.description;
    protocol = event.data.protocol;
    executablePath = event.data.executablePath;
    douyinInit();
  }
});