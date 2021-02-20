import { createSlice, Slice, SliceCaseReducers, PayloadAction, CaseReducerActions, ActionCreator } from '@reduxjs/toolkit';
import { differenceBy } from 'lodash-es';
import dbRedux, { loginOptionsObjectStoreName, roomIdObjectStoreName } from '../../../utils/idb/dbRedux';
import type { OptionsItem } from '../../../types';

export interface OptionsInitialState {
  optionsList: Array<OptionsItem>;
}

type CaseReducers = SliceCaseReducers<OptionsInitialState>;

const { actions, reducer }: Slice = createSlice<OptionsInitialState, CaseReducers>({
  name: 'options',
  initialState: {
    optionsList: []
  },
  reducers: {
    // 配置列表
    setOptionsList(state: OptionsInitialState, action: PayloadAction<{ result: Array<OptionsItem> }>): void {
      state.optionsList = action.payload.result;
    },

    // 删除配置
    setOptionsDeleteList(state: OptionsInitialState, action: PayloadAction<{ query: string }>): void {
      const optionsList: Array<OptionsItem> = state.optionsList;
      const newList: Array<OptionsItem> = differenceBy<OptionsItem, { id: string }>(
        optionsList,
        [{ id: action.payload.query }],
        'id'
      );

      state.optionsList = newList;
    }
  }
});

export const { setOptionsList, setOptionsDeleteList }: CaseReducerActions<CaseReducers> = actions;


// 保存数据
export const saveFormData: ActionCreator<any> = dbRedux.putAction({
  objectStoreName: loginOptionsObjectStoreName
});

// 配置列表
export const queryOptionsList: ActionCreator<any> = dbRedux.cursorAction({
  objectStoreName: loginOptionsObjectStoreName,
  successAction: setOptionsList
});

// 删除
export const deleteOption: ActionCreator<any> = dbRedux.deleteAction({
  objectStoreName: loginOptionsObjectStoreName,
  successAction: setOptionsDeleteList
});

// 获取单个配置
export const getOptionItem: ActionCreator<any> = dbRedux.getAction({
  objectStoreName: loginOptionsObjectStoreName
});

// 获取单个配置
export const saveRoomId: ActionCreator<any> = dbRedux.putAction({
  objectStoreName: roomIdObjectStoreName
});

export const deleteRoomId: ActionCreator<any> = dbRedux.deleteAction({
  objectStoreName: roomIdObjectStoreName
});

export default { options: reducer };