import { createAction, handleActions } from 'redux-actions';
import { fromJS } from 'immutable';
import option from '../../publicMethod/option';
import { db } from '../../publicMethod/initIndexedDB';

/* 使用immutable初始化基础数据 */
const initData: {
  optionList: Array
} = {
  optionList: []   // QQ配置列表
};

export const optionList: Function = createAction('补卡配置列表');
export const cursorOption: Function = db.cursorAction({
  objectStoreName: option.indexeddb.objectStore[0].name,
  successAction: optionList
});

/* reducer */
const reducer: Function = handleActions({
  [optionList]: ($$state: Immutable.Map, action: Object): Immutable.Map=>{
    const data: Array = 'optionList' in action.payload ? action.payload.optionList : action.payload.result;
    return $$state.set('optionList', data);
  }
}, fromJS(initData));

export default {
  buka: reducer
};