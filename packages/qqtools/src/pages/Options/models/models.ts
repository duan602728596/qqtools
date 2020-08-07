import { createAction, handleActions, ActionFunctionAny } from 'redux-actions';
import { fromJS, Map as IMap, List } from 'immutable';
import type { AnyAction, ActionCreator } from 'redux';
import { differenceBy } from 'lodash';
import dbRedux, { objectStoreName } from '../../../function/dbInit/dbRedux';
import type { OptionsItem } from '../../../types';

const $$initData: IMap<string, any> = fromJS({
  optionsList: []
});

// 保存数据
export const saveFormData: ActionCreator<any> = dbRedux.putAction({ objectStoreName });

// 配置列表
export const setOptionsList: ActionFunctionAny<any> = createAction('options/配置列表');
export const queryOptionsList: ActionCreator<any> = dbRedux.cursorAction({
  objectStoreName,
  successAction: setOptionsList
});

// 删除
export const setOptionsDeleteList: ActionFunctionAny<any> = createAction('options/删除配置');
export const deleteOption: ActionCreator<any> = dbRedux.deleteAction({
  objectStoreName,
  successAction: setOptionsDeleteList
});

// 获取单个配置
export const getOptionItem: ActionCreator<any> = dbRedux.getAction({ objectStoreName });

export default {
  options: handleActions({
    [setOptionsList as any]($$state: IMap<string, any>, action: AnyAction): IMap<string, any> {
      return $$state.set('optionsList', List(action.payload.result));
    },

    [setOptionsDeleteList as any]($$state: IMap<string, any>, action: AnyAction): IMap<string, any> {
      const optionsList: Array<OptionsItem> = $$state.get('optionsList').toJS();
      const newList: Array<OptionsItem> = differenceBy<OptionsItem, { id: string }>(
        optionsList,
        [{ id: action.payload.query }],
        'id'
      );

      return $$state.set('optionsList', List(newList));
    }
  }, $$initData)
};