import { createAction, handleActions } from 'redux-actions';
import { fromJS } from 'immutable';
import option from '../../publicMethod/option';
import { db } from '../../publicMethod/initIndexedDB';

/* 使用immutable初始化基础数据 */
const initData: {
  qqLoginList: Array,
  optionList: Array,
  kd48LiveListenerTimer: number
} = {
  qqLoginList: [],              // QQ登录列表
  optionList: [],               // QQ配置列表
  kd48LiveListenerTimer: null   // 监听口袋48直播
};

/* Action */
export const changeQQLoginList: Function = createAction('获取已登录的列表');
export const optionList: Function = createAction('配置列表');
export const cursorOption: Function = db.cursorAction({
  objectStoreName: option.indexeddb.objectStore[0].name,
  successAction: optionList
});
export const getLoginInformation: Function = db.getAction({
  objectStoreName: option.indexeddb.objectStore[2].name
});
// 口袋直播监听
export const kd48LiveListenerTimer: Function = createAction('口袋直播监听');

/* reducer */
const reducer: Function = handleActions({
  [changeQQLoginList]: ($$state: Immutable.Map, action: Object): Immutable.Map=>{
    return $$state.set('qqLoginList', action.payload.qqLoginList);
  },
  [optionList]: ($$state: Immutable.Map, action: Object): Immutable.Map=>{
    const data: Array = 'optionList' in action.payload ? action.payload.optionList : action.payload.result;
    return $$state.set('optionList', data);
  },
  [kd48LiveListenerTimer]: ($$state: Immutable.Map, action: Object): Immutable.Map=>{
    return $$state.set('kd48LiveListenerTimer', action.payload.timer);
  }
}, fromJS(initData));

export default {
  login: reducer
};