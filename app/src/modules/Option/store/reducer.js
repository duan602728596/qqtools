import { createAction, handleActions } from 'redux-actions';
import { fromJS } from 'immutable';
import option from '../../publicMethod/option';
import { db } from '../../publicMethod/initIndexedDB';

/* 使用immutable初始化基础数据 */
const initData: {
  optionList: Array
} = {
  optionList: []  // QQ配置列表
};

/* Action */
const opt: {
  objectStoreName: string
} = {
  objectStoreName: option.indexeddb.objectStore.option.name
};
export const optionList = createAction('配置列表');
export const putOption = db.putAction(opt);
export const cursorOption = db.cursorAction({
  ...opt,
  successAction: optionList
});
export const deleteOption = db.deleteAction(opt);
// 导入所有配置
export const importOption = db.putAction(opt);

/* reducer */
const reducer: Function = handleActions({
  [optionList]: ($$state: Immutable.Map, action: Object): Immutable.Map=>{
    const data: Array = 'optionList' in action.payload ? action.payload.optionList : action.payload.result;
    return $$state.set('optionList', data);
  }
}, fromJS(initData));

export default {
  option: reducer
};