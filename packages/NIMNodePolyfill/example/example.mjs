import process from 'node:process';
import '../NIMNodePolyfill.mjs';
import QChatSDK from 'nim-web-sdk-ng/dist/QCHAT_BROWSER_SDK.js';
import NIMSDK from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK.js';

const appKey = process.env.APP_KEY,
  account = process.env.ACCOUNT,
  token = process.env.TOKEN,
  allMessage = process.env.ALL_MESSAGE === '1';

const servers = [
  { serverId: '951573' },  // 王奕
  { serverId: '951572' },  // 周诗语
  { serverId: '1147920' }, // 天草
  { serverId: '1214149' }, // 袁17
  { serverId: '1181226' }, // ddd
  { serverId: '1148713' }  // zmh
];
const serversIds = servers.map((item) => item.serverId);

async function main() {
  const nim = new NIMSDK({
    appkey: appKey,
    account,
    token
  });

  await nim.connect();

  const linkAddresses = await nim.plugin.getQChatAddress({});

  const qchat = new QChatSDK({
    appkey: appKey,
    account,
    token,
    linkAddresses
  });

  qchat.on('logined', async function(loginResult) {
    console.log(100, loginResult);

    const result = await qchat.qchatServer.subscribeAllChannel({
      type: 1,
      serverIds: serversIds
    });

    console.log(101, result);

    const result2 = await qchat.qchatServer.getServers({
      serverIds: serversIds
    });

    console.log(102, result2);

    const result3 = await qchat.qchatChannel.getChannels({
      channelIds: result.unreadInfos.map((item) => item.channelId)
    });

    console.log(103, result3);
  });

  qchat.on('message', function(msg) {
    if (!serversIds.includes(msg.serverId)) {
      return;
    }

    let type = 113;

    try {
      msg.ext = JSON.parse(msg.ext);
      type = 112;
    } catch {}

    if (msg?.ext?.user?.roleId === 3) {
      console.log(200, msg);
    } else {
      allMessage && console.log(type, msg);
    }
  });

  await qchat.login();
}

main();