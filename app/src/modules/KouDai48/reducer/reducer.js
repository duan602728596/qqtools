import { createAction, handleActions } from 'redux-actions';
import { fromJS } from 'immutable';
import option from '../../../components/option/option';
import { db } from '../../../components/indexedDB/indexedDB-init';

/* 使用immutable初始化基础数据 */
const initData = {
  loginInformation: null // 登录信息
};

/* Action */
const opt = {
  objectStoreName: option.indexeddb.objectStore[2].name // loginInformation
};
const opt2 = {
  objectStoreName: option.indexeddb.objectStore[1].name // memberId
};

export const loginInformation = createAction('登录信息');
export const getLoginInformation = db.getAction({
  ...opt,
  successAction: loginInformation
});
export const putLoginInformation = db.putAction({
  ...opt,
  successAction: loginInformation
});
export const clearLoginInformation = db.clearAction(opt);

export const getMemberInformation = db.getAction(opt2);
export const addMemberInformation = db.addAction(opt2);
export const cursorMemberInformation = db.cursorAction(opt2);
export const clearMemberInformation = db.clearAction(opt2);

/* reducer */
const reducer = handleActions({
  [loginInformation]: ($$state, action) => {
    const data = 'data' in action.payload ? action.payload.data : action.payload.result;

    return $$state.set('loginInformation', data ? data : null);
  }
}, fromJS(initData));

export default {
  kouDai48: reducer
};