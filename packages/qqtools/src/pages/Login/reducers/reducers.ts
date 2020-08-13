import { createSlice, Slice, CaseReducer, PayloadAction, CaseReducerActions } from '@reduxjs/toolkit';
import QQ from '../../../function/QQ/QQ';

export interface LoginInitialState {
  loginList: Map<string, Array<QQ>>;
}

export interface CaseReducers {
  [key: string]: CaseReducer<LoginInitialState, PayloadAction<any>>;
}

const { actions, reducer }: Slice = createSlice<LoginInitialState, CaseReducers>({
  name: 'login',
  initialState: {
    loginList: new Map() // 使用Map存储数组，保证里面的值不被immer处理
  },
  reducers: {
    // 登陆列表
    setLoginList(state: LoginInitialState, action: PayloadAction<Map<string, Array<QQ>>>): LoginInitialState {
      state.loginList = action.payload;

      return state;
    }
  }
});

export const { setLoginList }: CaseReducerActions<CaseReducers> = actions;
export default { login: reducer };