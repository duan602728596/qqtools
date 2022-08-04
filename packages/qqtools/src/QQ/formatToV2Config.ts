import { pick } from '../utils/lodash';
import type { OptionsItemValue, OptionsItemValueV2 } from '../types';

function isOldConfig(oldConfig: OptionsItemValue | OptionsItemValueV2): oldConfig is OptionsItemValue {
  return !('version' in oldConfig);
}

/* 格式化数据格式 */
function formatToV2Config(oldConfig: OptionsItemValue | OptionsItemValueV2): OptionsItemValueV2 {
  // 数据处理，保证数据的格式
  if (isOldConfig(oldConfig)) {
    const formatValue: OptionsItemValueV2 = pick(oldConfig, [
      'optionName',
      'optionType',
      'qqNumber',
      'groupNumber',
      'socketHost',
      'socketPort',
      'authKey',
      'groupWelcome',
      'groupWelcomeSend',
      'customCmd'
    ]);
    const [pocket48, weibo, bilibili, cronTimer]: Array<Pick<OptionsItemValue, keyof OptionsItemValue>> = [
      pick(oldConfig, [
        'pocket48RoomListener',
        'pocket48RoomId',
        'pocket48IsAnonymous',
        'pocket48Account',
        'pocket48Token',
        'pocket48LiveAtAll',
        'pocket48ShieldMsgType',
        'pocket48RoomEntryListener',
        'pocket48OwnerOnlineListener',
        'pocket48MemberInfo',
        'pocket48LogSave',
        'pocket48LogDir'
      ]),
      pick(oldConfig, [
        'weiboListener',
        'weiboUid',
        'weiboAtAll',
        'weiboSuperTopicListener',
        'weiboSuperTopicLfid'
      ]),
      pick(oldConfig, [
        'bilibiliLive',
        'bilibiliLiveId',
        'bilibiliAtAll'
      ]),
      pick(oldConfig, [
        'cronJob',
        'cronTime',
        'cronSendData'
      ])
    ];

    Object.values(pocket48).some((o: any): boolean => o !== undefined) && (formatValue.pocket48 = [pocket48]);
    Object.values(weibo).some((o: any): boolean => o !== undefined) && (formatValue.weibo = [weibo]);
    Object.values(bilibili).some((o: any): boolean => o !== undefined) && (formatValue.bilibili = [bilibili]);
    Object.values(cronTimer).some((o: any): boolean => o !== undefined) && (formatValue.cronTimer = [cronTimer]);
    formatValue.version = 'v2';

    return formatValue;
  }

  return oldConfig;
}

export default formatToV2Config;