import { createSlice, Slice, SliceCaseReducers, PayloadAction, CaseReducerActions, ActionCreator } from '@reduxjs/toolkit';
import dbRedux, { loginOptionsObjectStoreName, roomIdObjectStoreName } from '../../../utils/idb/dbRedux';
import type { OptionsItem } from '../../../types';

export interface OptionsInitialState {
  optionsList: Array<OptionsItem>;
}

type CaseReducers = SliceCaseReducers<OptionsInitialState>;

const { actions, reducer }: Slice = createSlice<OptionsInitialState, CaseReducers, 'options'>({
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
      state.optionsList = state.optionsList.filter((o: OptionsItem): boolean => o.id !== action.payload.query);
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