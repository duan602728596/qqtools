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
const opt: {
  objectStoreName: string
} = {
  objectStoreName: option.indexeddb.objectStore[2].name
};
const opt2: {
  objectStoreName: string
} = {
  objectStoreName: option.indexeddb.objectStore[1].name
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
export const getMemberInformation = db.getAction(opt2);
export const addMemberInformation = db.addAction(opt2);

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