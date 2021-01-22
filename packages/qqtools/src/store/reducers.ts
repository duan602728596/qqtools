import { ReducersMapObject } from '@reduxjs/toolkit';
import loginReducers from '../pages/Login/reducers/reducers';
import optionsReducers from '../pages/Options/reducers/reducers';

/* reducers */
export const reducersMapObject: ReducersMapObject = Object.assign({},
  loginReducers,
  optionsReducers
);

export const ignoreOptions: any = {
  ignoredPaths: ['login.loginList'],
  ignoredActions: ['login/setLoginList']
};