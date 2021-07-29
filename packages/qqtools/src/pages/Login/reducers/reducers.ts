import {
  createSlice,
  Slice,
  SliceCaseReducers,
  PayloadAction,
  CaseReducerActions,
  ActionCreator
} from '@reduxjs/toolkit';
import dbRedux, { roomIdObjectStoreName } from '../../../utils/idb/dbRedux';
import QQ from '../../../QQ/QQ';
import OicqQQ from '../../../QQ/OicqQQ';

export interface LoginInitialState {
  loginList: Array<QQ | OicqQQ>;
}

type CaseReducers = SliceCaseReducers<LoginInitialState>;

const { actions, reducer }: Slice = createSlice<LoginInitialState, CaseReducers>({
  name: 'login',
  initialState: {
    loginList: [] // 使用Map存储数组，保证里面的值不被immer处理
  },
  reducers: {
    // 添加一个新的登陆
    setAddLogin(state: LoginInitialState, action: PayloadAction<QQ | OicqQQ>): void {
      state.loginList = state.loginList.concat([action.payload]);
    },

    // 删除登陆
    setDeleteLogin(state: LoginInitialState, action: PayloadAction<QQ | OicqQQ>): void {
      state.loginList = state.loginList.filter((o: QQ | OicqQQ): boolean => o.id !== action.payload.id);
    }
  }
});

export const { setAddLogin, setDeleteLogin }: CaseReducerActions<CaseReducers> = actions;

export const getRoomId: ActionCreator<any> = dbRedux.getAction({
  objectStoreName: roomIdObjectStoreName
});

export default { login: reducer };