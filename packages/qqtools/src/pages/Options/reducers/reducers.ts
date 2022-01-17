import { createSlice, type Slice, type SliceCaseReducers, type PayloadAction, type CaseReducerActions } from '@reduxjs/toolkit';
import type { DataDispatchFunc, QueryDispatchFunc, CursorDispatchFunc } from '@indexeddb-tools/indexeddb-redux';
import IDBRedux, { loginOptionsObjectStoreName, roomIdObjectStoreName } from '../../../utils/IDB/IDBRedux';
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
export const saveFormData: DataDispatchFunc = IDBRedux.putAction({
  objectStoreName: loginOptionsObjectStoreName
});

// 配置列表
export const queryOptionsList: CursorDispatchFunc = IDBRedux.cursorAction({
  objectStoreName: loginOptionsObjectStoreName,
  successAction: setOptionsList
});

// 删除
export const deleteOption: QueryDispatchFunc = IDBRedux.deleteAction({
  objectStoreName: loginOptionsObjectStoreName,
  successAction: setOptionsDeleteList
});

// 获取单个配置
export const getOptionItem: QueryDispatchFunc = IDBRedux.getAction({
  objectStoreName: loginOptionsObjectStoreName
});

// 获取单个配置
export const saveRoomId: DataDispatchFunc = IDBRedux.putAction({
  objectStoreName: roomIdObjectStoreName
});

export const deleteRoomId: QueryDispatchFunc = IDBRedux.deleteAction({
  objectStoreName: roomIdObjectStoreName
});

export default { options: reducer };