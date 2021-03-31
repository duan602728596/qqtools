import {
  createSlice,
  Slice,
  SliceCaseReducers,
  PayloadAction,
  CaseReducerActions,
  ActionCreator
} from '@reduxjs/toolkit';

export interface MiraiLoginInitialState {
  childProcessWorker: Worker | null;
}

type CaseReducers = SliceCaseReducers<MiraiLoginInitialState>;

const { actions, reducer }: Slice = createSlice<MiraiLoginInitialState, CaseReducers>({
  name: 'miraiLogin',
  initialState: {
    childProcessWorker: null
  },
  reducers: {
    // 设置mirai登陆的线程
    setChildProcessWorker(state: MiraiLoginInitialState, action: PayloadAction<Worker | undefined>) {
      if (action.payload) {
        state.childProcessWorker = action.payload;
      } else {
        state.childProcessWorker?.terminate();
        state.childProcessWorker = null;
      }
    }
  }
});

export const { setChildProcessWorker }: CaseReducerActions<CaseReducers> = actions;

export default { miraiLogin: reducer };