// @flow
import { createAction, handleActions } from 'redux-actions';
import { fromJS } from 'immutable';

/* 使用immutable初始化基础数据 */
const initData: {
  qqLoginList: Array
} = {
  qqLoginList: []  // QQ登录列表
};

/* Action */
export const changeQQLoginList = createAction('获取已登录的列表');

/* reducer */
const reducer: Function = handleActions({
  [changeQQLoginList]: (state: Object, action: Object): Object=>{
    return state.set('qqLoginList', action.payload.qqLoginList);
  }
}, fromJS(initData));

export default {
  login: reducer
};