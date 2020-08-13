import { combineReducers, ReducersMapObject, Reducer } from '@reduxjs/toolkit';
import loginReducers from '../pages/Login/reducers/reducers';
import optionsReducers from '../pages/Options/reducers/reducers';

/* reducers */
const reducers: ReducersMapObject = {
  ...loginReducers,
  ...optionsReducers
};

/* 创建reducer */
export function createReducer(asyncReducers: ReducersMapObject): Reducer {
  return combineReducers({
    ...reducers,
    ...asyncReducers
  });
}