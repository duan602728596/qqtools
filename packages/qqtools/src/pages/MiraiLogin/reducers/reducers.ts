import { createSlice, type Slice, type SliceCaseReducers, type PayloadAction } from '@reduxjs/toolkit';
import type { QueryDispatchFunc, CursorDispatchFunc, DataDispatchFunc } from '@indexeddb-tools/indexeddb-redux';
import IDBRedux, { qqObjectStoreName } from '../../../utils/IDB/IDBRedux';
import type { QQLoginItem } from '../types';
import type { IDBActionFunc } from '../../../types';

export interface MiraiLoginInitialState {
  childProcessWorker: Worker | null;
  qqLoginList: Array<QQLoginItem>;
}

type CaseReducers = SliceCaseReducers<MiraiLoginInitialState>;

const { actions, reducer }: Slice = createSlice<MiraiLoginInitialState, CaseReducers, 'miraiLogin'>({
  name: 'miraiLogin',
  initialState: {
    childProcessWorker: null, // worker
    qqLoginList: []           // 账户列表
  },
  reducers: {
    // 设置mirai登陆的线程
    setChildProcessWorker(state: MiraiLoginInitialState, action: PayloadAction<Worker | undefined>): void {
      if (action.payload) {
        state.childProcessWorker = action.payload;
      } else {
        state.childProcessWorker?.terminate();
        state.childProcessWorker = null;
      }
    },

    // 获取数据库的信息
    setQQLoginList(state: MiraiLoginInitialState, action: PayloadAction<{ result: Array<QQLoginItem> }>): void {
      state.qqLoginList = action.payload.result;
    },

    // 删除配置
    setQQLoginDeleteList(state: MiraiLoginInitialState, action: PayloadAction<{ query: string }>): void {
      state.qqLoginList = state.qqLoginList.filter((o: QQLoginItem): boolean => o.qq !== action.payload.query);
    },

    // 添加配置
    setQQLoginAdd(state: MiraiLoginInitialState, action: PayloadAction<{ data: QQLoginItem }>): void {
      const qqLoginList: Array<QQLoginItem> = state.qqLoginList;
      const index: number = qqLoginList.findIndex((o: QQLoginItem): boolean => o.qq === action.payload.data.qq);

      if (index >= 0) {
        qqLoginList[index] = action.payload.data;
      } else {
        qqLoginList.push(action.payload.data);
      }

      state.qqLoginList = [...qqLoginList];
    }
  }
});

export const {
  setChildProcessWorker,
  setQQLoginList,
  setQQLoginDeleteList,
  setQQLoginAdd
}: Record<string, Function> = actions;

// 配置列表
export const queryQQLoginList: CursorDispatchFunc = IDBRedux.cursorAction({
  objectStoreName: qqObjectStoreName,
  successAction: setQQLoginList as IDBActionFunc
});

// 删除数据
export const deleteQQLoginItem: QueryDispatchFunc = IDBRedux.deleteAction({
  objectStoreName: qqObjectStoreName,
  successAction: setQQLoginDeleteList as IDBActionFunc
});

// 保存数据
export const saveQQLoginItemData: DataDispatchFunc = IDBRedux.putAction({
  objectStoreName: qqObjectStoreName,
  successAction: setQQLoginAdd as IDBActionFunc
});

export default { miraiLogin: reducer };