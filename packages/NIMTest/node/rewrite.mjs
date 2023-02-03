import process from 'node:process';
import fs from 'node:fs/promises';
import roomId from './roomId.json' assert { type: 'json' };

/* 创建一个json */
function createJson({ channelId, ownerId, serverId, channelName, ownerName }) {
  return {
    status: 200,
    success: true,
    message: 'OK',
    content: {
      userFunction: {
        muteVoiceManage: false,
        sendGift: true,
        sendText: true,
        sendGif: true,
        voiceChat: false,
        sendForward: true,
        sendVoice: false,
        sendImage: false,
        sendEmoticon: true,
        sendVideo: false,
        inTeamServer: false,
        channelManage: false,
        gameCenter: '',
        cdTime: 10
      },
      channelInfo: {
        teamId: 1105,
        functionType: 'CHAT_CHANNEL',
        channelId,
        ownerId,
        serverId,
        channelName,
        channelPocketType: 1,
        channelStatus: 1,
        serverType: 1,
        ownerName,
        pocketAccessMode: 0
      },
      userChatConfig: {
        bgImg: '',
        bubbleId: '283923487508824000'
      },
      roomRole: '0'
    }
  };
}

/**
 * https://pocketapi.48.cn/im/api/v1/im/team/room/info
 * response body: /(.|\n)+/
 */
const [name, _channelId] = process.argv.slice(2);
const item = roomId.roomId.find((o) => o.ownerName.includes(name));

if (item) {
  await fs.writeFile(
    './.info.json',
    JSON.stringify(createJson({
      channelId: Number(_channelId),
      ownerId: item.id,
      serverId: item.serverId,
      channelName: item.ownerName,
      ownerName: item.ownerName
    }))
  );
}