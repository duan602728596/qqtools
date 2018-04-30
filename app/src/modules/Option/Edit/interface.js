import $ from 'jquery';

/**
 * name       配置名称
 * id         配置的id
 * groupName  监听的群名称
 * basic      基础配置
 * custom     自定义配置
 */
type interfaceOptionType = {
  name: string;
  groupName: string;
  time: number,
  basic: {
    isModian: boolean,
    modianId: string,
    modianUrlTemplate: string,
    modianTemplate: string,
    is48LiveListener: boolean,
    isListenerAll: boolean,
    kd48LiveListenerMembers: string,
    isRoomListener: boolean,
    roomId: string,
    isWeiboListener: boolean,
    lfid: string,
    isTimingMessagePush: boolean,
    timingMessagePushFormat: string,
    timingMessagePushText: string,
    isXinZhiTianQi: boolean,
    xinZhiTianQiAPIKey: string,
    xinZhiTianQiTemplate: string,
    isTuLing: boolean,
    tuLingAPIKey: string
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
      modianId: value.modianId,
      modianUrlTemplate: value.modianUrlTemplate,
      modianTemplate: value.modianTemplate,
      // owhat
      isOwhat: value.isOwhat,
      owhatId: value.owhatId,
      owhatUrlTemplate: value.owhatUrlTemplate,
      owhatTemplate: value.owhatTemplate,
      // 口袋48监听
      is48LiveListener: value.is48LiveListener,
      isListenerAll: value.isListenerAll,
      kd48LiveListenerMembers: value.kd48LiveListenerMembers,
      // 成员房间信息监听
      isRoomListener: value.isRoomListener,
      roomId: value.roomId,
      isRoomSendImage: value.isRoomSendImage,
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
      // 天气
      isXinZhiTianQi: value.isXinZhiTianQi,
      xinZhiTianQiAPIKey: value.xinZhiTianQiAPIKey,
      // 图灵机器人
      isTuLing: value.isTuLing,
      tuLingAPIKey: value.tuLingAPIKey
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