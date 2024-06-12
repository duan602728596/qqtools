const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const _ = require('lodash');
const dayjs = require('dayjs');
const importESM = require('@sweet-milktea/utils/importESM');

require('dayjs/locale/zh-cn');
require('../../NIMNodePolyfill/NIMNodePolyfill.cjs');

const NIM_SDK = require('@yxim/nim-web-sdk/dist/SDK/NIM_Web_SDK_nodejs');

globalThis.document = undefined; // fix error

const QChatSDK = require('nim-web-sdk-ng/dist/QCHAT_BROWSER_SDK.js');

/**
 * @param { Record<string, any> } obj
 * @param { (k: string, v: any) => boolean } callback
 */
function objectSome(obj, callback) {
  let result = false;

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result = callback(key, obj[key]);

      if (result) break;
    }
  }

  return result;
}

/* Hack */
globalThis.WebSocket.prototype.ORIGINAL_send = globalThis.WebSocket.prototype.send;

globalThis.WebSocket.prototype.send = function() {
  if (/3:::/.test(arguments[0])) {
    const message = arguments[0].replace(/3:::/, '');
    let data = null;

    try {
      data = JSON.parse(message);
    } catch { /* noop */ }

    if (data && data?.SER === 1 && data?.SID === 24 && data?.Q?.length) {
      for (const Q of data.Q) {
        if (/Property/i.test(Q.t) && Q.v && objectSome(Q.v, (k, v) => /Native\/[0-9]/i.test(v))) {
          Q.v['6'] = 2;
          arguments[0] = `3:::${ JSON.stringify(data) }`;
          break;
        }
      }
    }
  }

  return this.ORIGINAL_send.apply(this, arguments);
};

dayjs.locale('zh-cn');

const fsP = fs.promises;
const { Chatroom } = NIM_SDK;

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
function getRoomInfo(chatroomId) {
  return new Promise(async (resolve, reject) => {
    const appKey = await importESM(path.join(__dirname, '../../qqtools/src/QQ/sdk/appKey.mjs'));
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

// 获取房间信息
function getServerInfo(serverId) {
  return new Promise(async (resolve, reject) => {
    try {
      const appKey = await importESM(path.join(__dirname, '../../qqtools/src/QQ/sdk/appKey.mjs'));
      const qchat = new QChatSDK({
        appkey: atob(appKey.default),
        account: pocket48Account,
        token: pocket48Token,
        linkAddresses: ['qchatweblink01.netease.im:443']
      });

      qchat.on('logined', async () => {
        const serverInfo = await qchat.qchatServer.getServers({
          serverIds: [serverId]
        });

        resolve({
          serverInfo,
          qchat,
          owner: serverInfo[0].owner,
          success: 1
        });
      });

      await qchat.login();
    } catch (err) {
      console.error(err);
    }
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

        // eslint-disable-next-line no-constant-condition
        if (resMembersInfo.body.status === 200 && resMembersInfo?.body?.content?.roomInfo && false) {
          const { roomId: rid, ownerName } = resMembersInfo.body.content.roomInfo;
          const { nimChatroomSocket, event, success } = await getRoomInfo(rid);
          const account = success ? event?.chatroom?.creator : undefined;

          ownerName2 = ownerName;
          nimChatroomSocket.disconnect();
          Object.assign(item, {
            id: friend,
            roomId: rid,
            account
          });

          console.log(`ID: ${ friend } ownerName: ${ ownerName } roomId: ${ rid } account: ${ account }`);
        }

        if (resServerJumpInfo.body.status === 200 && resServerJumpInfo?.body?.content?.jumpServerInfo) {
          const { channelId } = resServerJumpInfo.body.content;
          const { serverId, serverOwner, serverOwnerName, teamId } = resServerJumpInfo.body.content.jumpServerInfo;
          const { qchat, owner, success } = await getServerInfo(`${ serverId }`);

          await qchat.destroy();

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
