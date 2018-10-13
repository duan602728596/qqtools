import $ from 'jquery';

/**
 * name       配置名称
 * id         配置的id
 * groupName  监听的群名称
 * basic      基础配置
 * custom     自定义配置
 */
type interfaceOptionType = {
  name: string,
  qqNumber: string,
  groupNumber: string,
  socketPort: string,
  time: number,
  basic: {
    // 摩点
    isModian: boolean,
    isModianLeaderboard: boolean,
    modianId: string,
    modianUrlTemplate: string,
    modianTemplate: string,
    // 口袋48监听
    is48LiveListener: boolean,
    isListenerAll: boolean,
    liveListeningInterval: number,
    // 成员房间信息监听
    kd48LiveListenerMembers: string,
    isRoomListener: boolean,
    roomId: string,
    isRoomSendImage: boolean,
    // 微博监听
    isWeiboListener: boolean,
    lfid: string,
    // 新成员欢迎
    isNewGroupMember: boolean,
    welcomeNewGroupMember: string,
    // 群内定时消息推送
    isTimingMessagePush: boolean,
    timingMessagePushTime: string,
    timingMessagePushFormat: string,
    timingMessagePushText: string,
    // 群内帮助命令
    isHelpCommend: boolean
  },
  custom: Object
};

function interfaceOption(value: Object, customProfiles: { command: string, text: string }[]): interfaceOptionType{
  const custom: Object = customProfilesArray2Obj(customProfiles);
  const inter: interfaceOption = {
    name: value.name,
    qqNumber: value.qqNumber,
    groupNumber: value.groupNumber,
    socketPort: value.socketPort,
    time: new Date().getTime(),
    basic: {
      // 摩点
      isModian: value.isModian,
      isModianLeaderboard: value.isModianLeaderboard,
      modianId: value.modianId,
      modianUrlTemplate: value.modianUrlTemplate,
      modianTemplate: value.modianTemplate,
      // 口袋48监听
      is48LiveListener: value.is48LiveListener,
      isListenerAll: value.isListenerAll,
      kd48LiveListenerMembers: value.kd48LiveListenerMembers,
      // 成员房间信息监听
      isRoomListener: value.isRoomListener,
      roomId: value.roomId,
      isRoomSendImage: value.isRoomSendImage,
      liveListeningInterval: value.liveListeningInterval,
      // 微博监听
      isWeiboListener: value.isWeiboListener,
      lfid: value.lfid,
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

/* 将Array转换成Obj */
function customProfilesArray2Obj(customProfiles: { command: string, text: string }[]): Object{
  const custom: Object = {};
  $.each(customProfiles, (index: number, item: { command: string, text: string }): void=>{
    custom[item.command] = item.text;
  });
  return custom;
}

/* 将Obj转换成Array */
export function customProfilesObj2Array(customProfiles: Object): { command: string, text: string }[]{
  const custom: { command: string, text: string }[] = [];
  $.each(customProfiles, (key: string, value: string): void=>{
    custom.push({
      command: key,
      text: value
    });
  });
  return custom;
}

export default interfaceOption;