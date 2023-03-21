import { createSlice, type Slice, type PayloadAction, type CaseReducer, type CaseReducerActions } from '@reduxjs/toolkit';
import type { DataDispatchFunc, QueryDispatchFunc, CursorDispatchFunc } from '@indexeddb-tools/indexeddb-redux';
import IDBRedux, { loginOptionsObjectStoreName, roomIdObjectStoreName } from '../../../utils/IDB/IDBRedux';
import type { OptionsItem, IDBActionFunc } from '../../../commonTypes';

export interface OptionsInitialState {
  optionsList: Array<OptionsItem>;
}

type SliceReducers = {
  setOptionsList: CaseReducer<OptionsInitialState, PayloadAction<{ result: Array<OptionsItem> }>>;
  setOptionsDeleteList: CaseReducer<OptionsInitialState, PayloadAction<{ query: string }>>;
};

const sliceName: 'options' = 'options';
const { actions, reducer }: Slice<OptionsInitialState, SliceReducers, typeof sliceName> = createSlice({
  name: sliceName,
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

export const { setOptionsList, setOptionsDeleteList }: CaseReducerActions<SliceReducers, typeof sliceName> = actions;

// 保存数据
export const saveFormData: DataDispatchFunc = IDBRedux.putAction({
  objectStoreName: loginOptionsObjectStoreName
});

// 配置列表
export const queryOptionsList: CursorDispatchFunc = IDBRedux.cursorAction({
  objectStoreName: loginOptionsObjectStoreName,
  successAction: setOptionsList as IDBActionFunc
});

// 删除
export const deleteOption: QueryDispatchFunc = IDBRedux.deleteAction({
  objectStoreName: loginOptionsObjectStoreName,
  successAction: setOptionsDeleteList as IDBActionFunc
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

export default { [sliceName]: reducer };