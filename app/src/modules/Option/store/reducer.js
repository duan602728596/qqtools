import { createAction, handleActions } from 'redux-actions';
import { fromJS, List } from 'immutable';
import option from '../../../components/option/option';
import { db } from '../../../components/indexedDB/initIndexedDB';

/* 使用immutable初始化基础数据 */
const initData: {
  optionList: Immutable.List
} = {
  optionList: List([])  // QQ配置列表
};

/* Action */
const opt: {
  objectStoreName: string
} = {
  objectStoreName: option.indexeddb.objectStore[0].name
};
export const optionList: Function = createAction('配置列表');
export const putOption: Function = db.putAction(opt);
export const cursorOption: Function = db.cursorAction({
  ...opt,
  successAction: optionList
});
export const deleteOption: Function = db.deleteAction(opt);
// 导入所有配置
export const importOption: Function = db.putAction(opt);

/* reducer */
const reducer: Function = handleActions({
  [optionList]: ($$state: Immutable.Map, action: Object): Immutable.Map=>{
    const data: Array = 'optionList' in action.payload ? action.payload.optionList : action.payload.result;
    return $$state.set('optionList', List(data));
  }
}, fromJS(initData));

export default {
  option: reducer
};