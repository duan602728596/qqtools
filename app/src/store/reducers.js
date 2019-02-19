// @flow
import { combineReducers } from 'redux-immutable';

/* reducers */
const reducers: Object = {};

/* 创建reducer */
export function createReducer(asyncReducers: Object): Function {
  return combineReducers({
    ...reducers,
    ...asyncReducers
  });
}