import { combineReducers, ReducersMapObject, Reducer } from 'redux';
import optionsModels from '../pages/Options/models/models';

/* reducers */
const reducers: ReducersMapObject = {
  ...optionsModels
};

/* 创建reducer */
export function createReducer(asyncReducers: ReducersMapObject): Reducer {
  return combineReducers({
    ...reducers,
    ...asyncReducers
  });
}