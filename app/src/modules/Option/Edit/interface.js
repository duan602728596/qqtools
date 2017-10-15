// @flow
import jQuery from 'jquery';
/**
 * name       配置名称
 * id         配置的id
 * groupName  监听的群名称
 * basic      基础配置
 * custom     自定义配置
 */
type interfaceOption = {
  name: string;
  groupName: string;
  time: number,
  basic: {
    isWds: boolean,
    wdsId: string,
    wdsTemplate: string,
    is48LiveListener: boolean,
    kd48LiveListenerMembers: string,
    isXinZhiTianQi: boolean,
    xinZhiTianQiAPIKey: string,
    xinZhiTianQiTemplate: string,
    isTuLing: boolean,
    tuLingAPIKey: string
  },
  custom: Object
};

function interfaceOption(value: Object, customProfiles: { command: string, text: string }[]): interfaceOption{
  const custom: Object = customProfilesArray2Obj(customProfiles);
  const inter: interfaceOption = {
    name: value.name,
    groupName: value.groupName,
    time: new Date().getTime(),
    basic: {
      isWds: value.isWds.length > 0,
      wdsId: value.wdsId,
      wdsTemplate: value.wdsTemplate,
      is48LiveListener: value.is48LiveListener.length > 0,
      kd48LiveListenerMembers: value.kd48LiveListenerMembers,
      isNewBlood: value.isNewBlood.length > 0,
      newBloodTemplate: value.newBloodTemplate,
      isXinZhiTianQi: value.isXinZhiTianQi.length > 0,
      xinZhiTianQiAPIKey: value.xinZhiTianQiAPIKey,
      xinZhiTianQiTemplate: value.xinZhiTianQiTemplate,
      isTuLing: value.isTuLing.length > 0,
      tuLingAPIKey: value.tuLingAPIKey
    },
    custom
  };
  return inter;
}

/* 将Array转换成Obj */
function customProfilesArray2Obj(customProfiles: { command: string, text: string }[]): Object{
  const custom: Object = {};
  jQuery.each(customProfiles, (index: number, item: { command: string, text: string }): void=>{
    custom[item.command] = item.text;
  });
  return custom;
}

/* 将Obj转换成Array */
export function customProfilesObj2Array(customProfiles: Object): { command: string, text: string }[]{
  const custom: { command: string, text: string }[] = [];
  jQuery.each(customProfiles, (key: string, value: string): void=>{
    custom.push({
      command: key,
      text: value
    });
  });
  return custom;
}

export default interfaceOption;