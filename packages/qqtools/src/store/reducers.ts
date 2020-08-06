import { combineReducers, ReducersMapObject, Reducer } from 'redux';

/* reducers */
const reducers: ReducersMapObject = {};

/* 创建reducer */
export function createReducer(asyncReducers: ReducersMapObject): Reducer {
  return combineReducers({
    ...reducers,
    ...asyncReducers
  });
}