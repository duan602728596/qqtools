import $ from 'jquery';

/* 将Array转换成Obj */
function customProfilesArray2Obj(customProfiles) {
  const custom = {};

  $.each(customProfiles, (index, item) => {
    custom[item.command] = item.text;
  });

  return custom;
}

/* 将Obj转换成Array */
export function customProfilesObj2Array(customProfiles) {
  const custom = [];

  $.each(customProfiles, (key, value) => {
    custom.push({
      command: key,
      text: value
    });
  });

  return custom;
}

/**
 * name       配置名称
 * id         配置的id
 * groupName  监听的群名称
 * basic      基础配置
 * custom     自定义配置
 */
function interfaceOption(value, customProfiles) {
  const custom = customProfilesArray2Obj(customProfiles);
  const inter = {
    name: value.name,
    qqNumber: value.qqNumber,
    groupNumber: value.groupNumber,
    socketPort: value.socketPort,
    time: new Date().getTime(),
    basic: {
      // 摩点
      isModian: value.isModian,
      noIdol: value.noIdol,
      isModianLeaderboard: value.isModianLeaderboard,
      modianId: value.modianId,
      modianUrlTemplate: value.modianUrlTemplate,
      modianTemplate: value.modianTemplate,
      // 抽卡
      isChouka: value.isChouka,
      isChaka: value.isChaka,
      isChoukaSendImage: value.isChoukaSendImage,
      choukaJson: value.choukaJson,
      bukaQQNumber: value.bukaQQNumber,
      // 口袋48监听
      is48LiveListener: value.is48LiveListener,
      isListenerAll: value.isListenerAll,
      is48LiveAtAll: value.is48LiveAtAll,
      kd48LiveListenerMembers: value.kd48LiveListenerMembers,
      // 成员房间信息监听
      isRoomListener: value.isRoomListener,
      roomId: value.roomId,
      isRoomSendImage: value.isRoomSendImage,
      isRoomSendRecord: value.isRoomSendRecord,
      liveListeningInterval: value.liveListeningInterval,
      // 微博监听
      isWeiboListener: value.isWeiboListener,
      isWeiboAtAll: value.isWeiboAtAll,
      lfid: value.lfid,
      isWeiboSendImage: value.isWeiboSendImage,
      // 绿洲监听
      isLvzhouListener: value.isLvzhouListener,
      isLvzhouAtAll: value.isLvzhouAtAll,
      lvZhouParams: value.lvZhouParams,
      lvZhouHeaders: value.lvZhouHeaders,
      isLvzhouSendImage: value.isLvzhouSendImage,
      // 新成员欢迎
      isNewGroupMember: value.isNewGroupMember,
      welcomeNewGroupMember: value.welcomeNewGroupMember,
      // 群内定时消息推送
      isTimingMessagePush: value.isTimingMessagePush,
      timingMessagePushTime: value.timingMessagePushTime,
      timingMessagePushFormat: value.timingMessagePushFormat,
      timingMessagePushText: value.timingMessagePushText,
      // 群内帮助命令
      isHelpCommend: value.isHelpCommend
    },
    custom
  };

  return inter;
}

export default interfaceOption;