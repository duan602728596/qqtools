/* 全局的store */
import { createStore, compose, applyMiddleware, ReducersMapObject, Reducer, StoreEnhancer, Store } from 'redux';
import thunk from 'redux-thunk';
import { fromJS } from 'immutable';
import { createReducer } from './reducers';

/* reducer列表 */
const reducer: Reducer = createReducer({});
const asyncReducers: ReducersMapObject = {}; // 异步的reducers

/* 中间件 */
const middleware: StoreEnhancer = applyMiddleware(thunk);

/* store */
const store: Store = {} as Store;

export function storeFactory(initialState: object = {}): Store {
  // 避免热替换导致redux的状态丢失
  if (Object.keys(store).length === 0) {
    const $$initialState: object = {};

    for (const key in initialState) {
      $$initialState[key] = fromJS(initialState[key]);
    }

    /* store */
    Object.assign(store, createStore(reducer, $$initialState, compose(middleware)));
  }

  return store;
}

/* 注入store */
export function injectReducers(asyncReducer: ReducersMapObject): void {
  for (const key in asyncReducer) {
    // 获取reducer的key值，并将reducer保存起来
    if (!(key in asyncReducers)) {
      const item: Reducer = asyncReducer[key];

      asyncReducers[key] = item;
    }
  }

  // 异步注入reducer
  store.replaceReducer(createReducer(asyncReducers));
}

export default store;