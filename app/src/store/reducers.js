/* reducers */
import { combineReducers } from 'redux-immutable';

const reducers: Object = {};

/* 创建reducer */
export function createReducer(asyncReducers: Object): Function {
  return combineReducers({
    ...reducers,
    ...asyncReducers
  });
}