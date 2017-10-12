// @flow
import { createAction, handleActions } from 'redux-actions';
import { fromJS } from 'immutable';
import { cursorAction } from 'indexeddb-tools-redux';
import option from '../../publicMethod/option';

/* 使用immutable初始化基础数据 */
const initData: {
  optionList: Array
} = {
  optionList: []  // QQ登录列表
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
export const optionList = createAction('配置列表');
export const cursorOptionList: Function = cursorAction({
  ...opt,
  successAction: optionList
});

/* reducer */
const reducer: Function = handleActions({
  [optionList]: (state: Object, action: Object): Object=>{
    const data: Array = 'optionList' in action.payload ? action.payload.optionList : action.payload;
    return state.set('optionList', data);
  }
}, fromJS(initData));

export default {
  option: reducer
};