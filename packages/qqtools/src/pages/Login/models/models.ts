import { createAction, handleActions } from 'redux-actions';
import type { AnyAction, ActionCreator } from 'redux';
import { fromJS, Map as IMap, List } from 'immutable';

const $$initData: IMap<string, any> = fromJS({
  loginList: []
});

export const setLoginList: ActionCreator<any> = createAction('login/已登陆列表');

export default {
  login: handleActions({
    [setLoginList as any]($$state: IMap<string, any>, action: AnyAction): IMap<string, any> {
      return $$state.set('loginList', List(action.payload));
    }
  }, $$initData)
};