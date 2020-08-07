import { combineReducers, ReducersMapObject, Reducer } from 'redux';
import loginModels from '../pages/Login/models/models';
import optionsModels from '../pages/Options/models/models';

/* reducers */
const reducers: ReducersMapObject = Object.assign({}, loginModels, optionsModels);

/* 创建reducer */
export function createReducer(asyncReducers: ReducersMapObject): Reducer {
  return combineReducers({
    ...reducers,
    ...asyncReducers
  });
}