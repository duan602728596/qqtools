const fs = require('node:fs');
const fsP = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const _ = require('lodash');
const dayjs = require('dayjs');
const { chromium } = require('playwright-core');

require('dayjs/locale/zh-cn');
dayjs.locale('zh-cn');

const token = '';
const pa = '';
const pocket48Account = '';
const pocket48Token = '';

const appInfo = JSON.stringify({
  vendor: 'apple',
  deviceId: '52727911-9996-4449-8888-137923752345',
  appVersion: '6.2.2',
  appBuild: '21080401',
  osVersion: '14.2.0',
  osType: 'ios',
  deviceName: 'iPhone XR',
  os: 'ios'
});

function headers() {
  return {
    appInfo,
    'Content-Type': 'application/json;charset=utf-8',
    Host: 'pocketapi.48.cn',
    'User-Agent': 'PocketFans201807/6.0.23 (iPhone; iOS 14.2; Scale/2.00)',
    token,
    pa
  };
}

// 获取房间信息
async function getServerInfo(serverId) {
  let browser = await chromium.launch({
    headless: true,
    executablePath: os.platform() === 'win32'
      ? 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
      : '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    timeout: 0
  });
  const context = await browser.newContext({
    viewport: {
      width: 660,
      height: 800
    }
  });
  const page = await context.newPage();

  await page.goto('file://' + path.join(__dirname, 'qchat.html'));

  // 设置token
  const accountHandle = await page.$('#account');

  await accountHandle.evaluate((node, v) => node.value = v, pocket48Account);

  const tokenHandle = await page.$('#token');

  await tokenHandle.evaluate((node, v) => node.value = v, pocket48Token);

  // server id
  const serverIdHandle = await page.$('#server-id');

  await serverIdHandle.evaluate((node, v) => node.value = v, String(serverId));

  // 执行js
  await page.evaluate(() => globalThis.runGetServerInfo());

  const resultHandle = await page.waitForSelector('#result');
  const serverInfo = await resultHandle.evaluate((node) => node.innerText);

  await browser.close();
  browser = null;

  return JSON.parse(serverInfo);
}

async function main() {
  const Got = await import('got');
  const got = Got.default;

  // 写入文件
  const fileName = path.join(__dirname, 'roomId.json');
  let roomId = [];

  if (fs.existsSync(fileName)) {
    const file = await fsP.readFile(fileName, { encoding: 'utf8' });
    const json = JSON.parse(file);

    roomId = json.roomId;
  }

  try {
    // 获取当前账号的关注id
    const resFriends = await got.post('https://pocketapi.48.cn/user/api/v1/friendships/friends/id', {
      headers: headers(),
      responseType: 'json',
      json: {}
    });
    const friends = resFriends.body.content.data;

    for (let i = 0, j = friends.length; i < j; i++) {
      const friend = friends[i];

      console.log(i, friends.length - 1);

      const index = _.findIndex(roomId, { id: friend });

      let item = {};

      if (index >= 0) {
        item = roomId[index];
        continue;

        // if (item?.team !== '预备生') {
        //   continue;
        // }
      }

      // 获取账号信息
      const [resMembersInfo, resServerJumpInfo, resArchives] = await Promise.all([
        got.post('https://pocketapi.48.cn/im/api/v1/im/room/info/type/source', {
          headers: headers(),
          responseType: 'json',
          json: {
            type: 0,
            sourceId: friend
          }
        }),
        got.post('https://pocketapi.48.cn/im/api/v1/im/server/jump', {
          headers: headers(),
          responseType: 'json',
          json: {
            targetType: 1,
            starId: friend
          }
        }),
        got.post('https://pocketapi.48.cn/user/api/v1/user/star/archives', {
          headers: headers(),
          responseType: 'json',
          json: {
            memberId: friend
          }
        })
      ]);

      if (resMembersInfo.body.status === 200 || resServerJumpInfo.body.status === 200) {
        let ownerName2;

        if (resServerJumpInfo.body.status === 200 && resServerJumpInfo?.body?.content?.jumpServerInfo) {
          const { channelId } = resServerJumpInfo.body.content;
          const { serverId, serverOwner, serverOwnerName } = resServerJumpInfo.body.content.jumpServerInfo;
          const { owner } = await getServerInfo(`${ serverId }`);

          item.ownerName = serverOwnerName ?? ownerName2;

          if (!item.id) {
            item.id = serverOwner;
          }

          Object.assign(item, {
            serverId,
            channelId,
            account: owner
          });

          if (resArchives.body.status === 200 && resArchives?.body?.content?.starInfo) {
            const { starTeamName, starTeamId, starGroupName, periodName, pinyin } = resArchives.body.content.starInfo;

            item.team = starTeamName;
            item.teamId = starTeamId;
            item.groupName = starGroupName;
            item.periodName = periodName;
            item.pinyin = pinyin;
          }

          console.log(`ID: ${ serverOwner } ownerName: ${ serverOwnerName } serverId: ${ item.serverId } team: ${ item.team }`);
        } else {
          ownerName2 && (item.ownerName = ownerName2);
        }

        if (Object.keys(item).length > 0) {
          if (index >= 0) {
            roomId[index] = item;
          } else {
            roomId.push(item);
          }
        }

        const newData = JSON.stringify({
          roomId: _.orderBy(roomId, ['id'], ['asc']),
          buildTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
        }, null, 2);

        if (newData !== '') {
          await fsP.writeFile(fileName, newData);
        }
      }
    }
  } catch (err) {
    console.error(err);
  }
}

main();
