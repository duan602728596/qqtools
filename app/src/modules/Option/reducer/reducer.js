import { createAction, handleActions } from 'redux-actions';
import { fromJS, List } from 'immutable';
import option from '../../../components/option/option';
import { db } from '../../../components/indexedDB/indexedDB-init';

/* 使用immutable初始化基础数据 */
const initData = {
  optionList: List([]) // QQ配置列表
};

/* Action */
const opt = {
  objectStoreName: option.indexeddb.objectStore[0].name
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
const reducer = handleActions({
  [optionList]: ($$state, action) => {
    const data = 'optionList' in action.payload ? action.payload.optionList : action.payload.result;

    return $$state.set('optionList', List(data));
  }
}, fromJS(initData));

export default {
  option: reducer
};