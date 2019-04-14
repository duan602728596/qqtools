import { combineReducers } from 'redux-immutable';

/* reducers */
const reducers = {};

/* 创建reducer */
export function createReducer(asyncReducers) {
  return combineReducers({
    ...reducers,
    ...asyncReducers
  });
}