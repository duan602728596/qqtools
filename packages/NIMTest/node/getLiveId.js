const fsP = require('node:fs/promises');
const path = require('node:path');
const { setTimeout } = require('node:timers');
const _ = require('lodash');
const dayjs = require('dayjs');

function rStr(len) {
  const str = 'QWERTYUIOPASDFGHJKLZXCVBNM1234567890';
  let result = '';

  for (let i = 0; i < len; i++) {
    const rIndex = Math.floor(Math.random() * str.length);

    result += str[rIndex];
  }

  return result;
}

function createHeaders() {
  const headers = {
    'Content-Type': 'application/json;charset=utf-8',
    appInfo: JSON.stringify({
      vendor: 'apple',
      deviceId: `${ rStr(8) }-${ rStr(4) }-${ rStr(4) }-${ rStr(4) }-${ rStr(12) }`,
      appVersion: '7.0.4',
      appBuild: '23011601',
      osVersion: '16.3.1',
      osType: 'ios',
      deviceName: 'iPhone XR',
      os: 'ios'
    }),
    'User-Agent': 'PocketFans201807/6.0.16 (iPhone; iOS 13.5.1; Scale/2.00)',
    'Accept-Language': 'zh-Hans-AW;q=1',
    Host: 'pocketapi.48.cn'
  };

  return headers;
}

async function requestLiveList() {
  const got = (await import('got')).default;
  const res = await got('https://pocketapi.48.cn/live/api/v1/live/getLiveList', {
    method: 'POST',
    headers: createHeaders(),
    responseType: 'json',
    json: { debug: true, next: 0, groupId: 0, record: false }
  });

  return res.body;
}

async function requestLiveRoomInfo(id) {
  const got = (await import('got')).default;
  const res = await got('https://pocketapi.48.cn/live/api/v1/live/getLiveOne', {
    method: 'POST',
    headers: createHeaders(),
    responseType: 'json',
    json: { liveId: id }
  });

  return res.body;
}

async function getRoomIdJson() {
  const file = await fsP.readFile(path.join(__dirname, 'roomId.json'), { encoding: 'utf-8' });

  return JSON.parse(file);
}

async function getLiveList() {
  try {
    const liveListRes = await requestLiveList();

    if (liveListRes.success) {
      const { roomId } = await getRoomIdJson();
      let hasChange = false;

      for (const item of liveListRes.content.liveList) {
        const roomIdItem = roomId.find((r) => r.id === Number(item.userInfo.userId));

        if (roomIdItem && !roomIdItem.liveRoomId) {
          const liveOneRes = await requestLiveRoomInfo(item.liveId);

          if (liveOneRes.success) {
            roomIdItem.liveRoomId = Number(liveOneRes.content.roomId);
            console.log(`添加了${ roomIdItem.ownerName }的直播间ID`);
            hasChange = true;
          }
        }
      }

      if (hasChange) {
        const nextData = JSON.stringify({
          roomId: _.orderBy(roomId, ['id'], ['asc']),
          buildTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
        }, null, 2);

        await fsP.writeFile(path.join(__dirname, 'roomId.json'), nextData);
      }
    }

  } catch (err) {
    console.error(err);
  }

  setTimeout(getLiveList, 3 * 60 * 1_000);
}

async function main() {
  const { roomId } = await getRoomIdJson();
  const noLiveRoomId = roomId.filter((o) => !o.liveRoomId)
    .map((o) => o.ownerName);

  console.log(`没有查询到LiveId的有：${ noLiveRoomId.join(', ') }`);
  getLiveList();
}

main();