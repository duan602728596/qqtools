import { createSlice, type Slice, type PayloadAction, type CaseReducer, type CaseReducerActions } from '@reduxjs/toolkit';
import type { QueryDispatchFunc } from '@indexeddb-tools/indexeddb-redux';
import IDBRedux, { roomIdObjectStoreName } from '../../../utils/IDB/IDBRedux';
import type { QQModals } from '../../../QQ/QQBotModals/ModalTypes';

export interface LoginInitialState {
  loginList: Array<QQModals>;
}

type SliceReducers = {
  setAddLogin: CaseReducer<LoginInitialState, PayloadAction<QQModals>>;
  setDeleteLogin: CaseReducer<LoginInitialState, PayloadAction<QQModals>>;
};

const sliceName: 'login' = 'login';
const { actions, reducer }: Slice<LoginInitialState, SliceReducers, typeof sliceName> = createSlice({
  name: sliceName,
  initialState: {
    loginList: [] // 使用Map存储数组，保证里面的值不被immer处理
  },
  reducers: {
    // 添加一个新的登陆
    setAddLogin(state: LoginInitialState, action: PayloadAction<QQModals>): void {
      state.loginList = state.loginList.concat([action.payload]);
    },

    // 删除登陆
    setDeleteLogin(state: LoginInitialState, action: PayloadAction<QQModals>): void {
      state.loginList = state.loginList.filter((o: QQModals): boolean => o.id !== action.payload.id);
    }
  }
});

export const { setAddLogin, setDeleteLogin }: CaseReducerActions<SliceReducers, typeof sliceName> = actions;

export const getRoomId: QueryDispatchFunc = IDBRedux.getAction({
  objectStoreName: roomIdObjectStoreName
});

export default { [sliceName]: reducer };