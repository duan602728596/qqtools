const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');
const got = require('got');
const _ = require('lodash');
const dayjs = require('dayjs');

require('dayjs/locale/zh-cn');

const NIM_SDK = require('./NIM_Web_SDK_nodejs_v7.1.0');
const el = require('./eval');

dayjs.locale('zh-cn');

const fsP = fs.promises;
const { Chatroom } = NIM_SDK;

const token = '';
const pa = '';

const appInfo = JSON.stringify({
  vendor: 'apple',
  deviceId: '52727911-9996-4449-8888-137923752345',
  appVersion: '6.0.23',
  appBuild: '201127',
  osVersion: '14.2.0',
  osType: 'ios',
  deviceName: 'iPhone XR',
  os: 'ios'
});
const headers = {
  appInfo,
  'Content-Type': 'application/json;charset=utf-8',
  Host: 'pocketapi.48.cn',
  'User-Agent': 'PocketFans201807/6.0.23 (iPhone; iOS 14.2; Scale/2.00)',
  token,
  pa
};

// 获取房间信息
function getRoomInfo(chatroomId) {
  return new Promise((resolve, reject) => {
    const nimChatroomSocket = Chatroom.getInstance({
      appKey: el,
      isAnonymous: true,
      chatroomNick: randomUUID(),
      chatroomAvatar: '',
      chatroomId,
      chatroomAddresses: ['chatweblink01.netease.im:443'],
      onconnect(event) {
        resolve({
          nimChatroomSocket,
          event
        });
      },
      onerror(err) {
        console.error(err);
      }
    });
  });
}

async function main() {
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
      headers,
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
      }

      // 获取账号信息
      const resMembersInfo = await got.post('https://pocketapi.48.cn/im/api/v1/im/room/info/type/source', {
        headers,
        responseType: 'json',
        json: {
          type: 0,
          sourceId: friend
        }
      });
      const { status, content } = resMembersInfo.body;

      if (status === 200) {
        const { roomId: rid, ownerName } = content.roomInfo;
        const { nimChatroomSocket, event } = await getRoomInfo(rid);
        const account = event?.chatroom?.creator;

        nimChatroomSocket.disconnect();
        Object.assign(item, { id: friend, ownerName, roomId: rid, account });

        if (index >= 0) {
          roomId[index] = item;
        } else {
          roomId.push(item);
        }

        console.log(`ID: ${ friend } ownerName: ${ ownerName } roomId: ${ rid } account: ${ account }`);

        const newData = JSON.stringify({
          roomId: _.orderBy(roomId, ['id'], ['asc']),
          buildTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
        }, null, 2);

        await fsP.writeFile(fileName, newData);
      } else if (status === 500) {
        console.error('pa过期');
        break;
      }
    }
  } catch (err) {
    console.error(err);
  }
}

main();
