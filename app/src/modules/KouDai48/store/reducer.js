import { createAction, handleActions } from 'redux-actions';
import { fromJS } from 'immutable';
import option from '../../publicMethod/option';
import { db } from '../../publicMethod/initIndexedDB';

/* 使用immutable初始化基础数据 */
const initData: {
  loginInformation: ?Object
} = {
  loginInformation: null  // 登录信息
};

/* Action */
type optType = {
  objectStoreName: string
};
const opt: optType = {
  objectStoreName: option.indexeddb.objectStore[2].name  // loginInformation
};
const opt2: optType = {
  objectStoreName: option.indexeddb.objectStore[1].name  // memberId
};
export const loginInformation: Function = createAction('登录信息');
export const getLoginInformation: Function = db.getAction({
  ...opt,
  successAction: loginInformation
});
export const putLoginInformation: Function = db.putAction({
  ...opt,
  successAction: loginInformation
});
export const clearLoginInformation: Function = db.clearAction(opt);

export const getMemberInformation: Function = db.getAction(opt2);
export const addMemberInformation: Function = db.addAction(opt2);
export const cursorMemberInformation: Function = db.cursorAction(opt2);
export const clearMemberInformation: Function = db.clearAction(opt2);

/* reducer */
const reducer: Function = handleActions({
  [loginInformation]: ($$state: Immutable.Map, action: Object): Immutable.Map=>{
    const data: Array = 'data' in action.payload ? action.payload.data : action.payload.result;
    return $$state.set('loginInformation', data ? data : null);
  }
}, fromJS(initData));

export default {
  kouDai48: reducer
};