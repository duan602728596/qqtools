const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const _ = require('lodash');
const dayjs = require('dayjs');

require('dayjs/locale/zh-cn');

const NIM_SDK = require('./NIM_Web_SDK_nodejs_v7.1.0');

dayjs.locale('zh-cn');

const fsP = fs.promises;
const { Chatroom } = NIM_SDK;

const teams = {
  '2001': '丝芭影视',
  '1001': 'TEAM SII',
  '1002': 'TEAM NII',
  '1003': 'TEAM HII',
  '1004': 'TEAM X',
  '1007': '预备生',
  '1105': 'BEJ48',
  '1201': 'TEAM G',
  '1202': 'TEAM NIII',
  '1203': 'TEAM Z',
  '1207': '预备生',
  '1404': 'CKG48',
  '1501': 'IDFT'
};

const token = '';
const pa = '';

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

function teamsPrefix(teamId) {
  const t = Number(teamId);

  if ([1001, 1002, 1003, 1004, 1007].includes(t)) return 'SNH48-';

  if (t === 1105) return 'BEJ48-';

  if ([1201, 1202, 1203, 1207].includes(t)) return 'GNZ48-';

  if (t === 1404) return 'CKG48-';

  if (t === 1501) return 'IDFT-';

  return '';
}

// 获取房间信息
function getRoomInfo(chatroomId) {
  return new Promise(async (resolve, reject) => {
    const appKey = await import(path.join(__dirname, '../../qqtools/src/QQ/sdk/appKey.mjs'));
    const nimChatroomSocket = Chatroom.getInstance({
      appKey: atob(appKey.default),
      isAnonymous: true,
      chatroomNick: randomUUID(),
      chatroomAvatar: '',
      chatroomId,
      chatroomAddresses: ['chatweblink01.netease.im:443'],
      onconnect(event) {
        resolve({
          nimChatroomSocket,
          event,
          success: 1
        });
      },
      ondisconnect(event) {
        resolve({
          nimChatroomSocket,
          event,
          success: 0
        });
      },
      onerror(err) {
        console.error(err);
      }
    });
  });
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
      }

      // 获取账号信息
      const [resMembersInfo, resServerJumpInfo] = await Promise.all([
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
        })
      ]);

      if (resMembersInfo.body.status === 200 || resServerJumpInfo.body.status === 200) {
        if (resMembersInfo.body.status === 200 && resMembersInfo?.body?.content?.roomInfo) {
          const { roomId: rid, ownerName } = resMembersInfo.body.content.roomInfo;
          const { nimChatroomSocket, event, success } = await getRoomInfo(rid);
          const account = success ? event?.chatroom?.creator : undefined;

          nimChatroomSocket.disconnect();
          Object.assign(item, {
            id: friend,
            ownerName,
            roomId: rid,
            account
          });

          console.log(`ID: ${ friend } ownerName: ${ ownerName } roomId: ${ rid } account: ${ account }`);
        }

        if (resServerJumpInfo.body.status === 200 && resServerJumpInfo?.body?.content?.jumpServerInfo) {
          const { serverId, serverOwner, serverOwnerName, teamId } = resServerJumpInfo.body.content.jumpServerInfo;

          if (!item.ownerName) {
            item.ownerName = `${ teamsPrefix(teamId) }${ serverOwnerName }`;
          }

          if (!item.id) {
            item.id = serverOwner;
          }

          Object.assign(item, {
            serverId,
            team: teams[`${ teamId }`]
          });

          console.log(`ID: ${ serverOwner } ownerName: ${ item.serverOwnerName } serverId: ${ item.serverId } team: ${ item.team }`);
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

        await fsP.writeFile(fileName, newData);
      }
    }
  } catch (err) {
    console.error(err);
  }
}

main();
