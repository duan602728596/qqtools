// @flow
import { createAction, handleActions } from 'redux-actions';
import { fromJS } from 'immutable';
import { cursorAction, deleteAction, putAction, getAction } from 'indexeddb-tools-redux';
import option from '../../publicMethod/option';

/* 使用immutable初始化基础数据 */
const initData: {
  qqLoginList: Array,
  optionList: Array,
  kd48LiveListenerWorker: Worker
} = {
  qqLoginList: [],              // QQ登录列表
  optionList: [],               // QQ配置列表
  kd48LiveListenerWorker: null  // 监听口袋48直播
};

/* Action */
const opt: {
  name: string,
  version: number,
  objectStoreName: string
} = {
  name: option.indexeddb.name,
  version: option.indexeddb.version,
  objectStoreName: option.indexeddb.objectStore.option.name
};
export const changeQQLoginList = createAction('获取已登录的列表');
export const optionList = createAction('配置列表');
export const cursorOption = cursorAction({
  ...opt,
  successAction: optionList
});
// 口袋直播监听
export const kd48LiveListenerWorker = createAction('口袋直播监听');

/* reducer */
const reducer: Function = handleActions({
  [changeQQLoginList]: (state: Object, action: Object): Object=>{
    return state.set('qqLoginList', action.payload.qqLoginList);
  },
  [optionList]: (state: Object, action: Object): Object=>{
    const data: Array = 'optionList' in action.payload ? action.payload.optionList : action.payload;
    return state.set('optionList', data);
  },
  [kd48LiveListenerWorker]: (state: Object, action: Object): Object=>{
    return state.set('kd48LiveListenerWorker', action.payload.worker);
  }
}, fromJS(initData));

export default {
  login: reducer
};