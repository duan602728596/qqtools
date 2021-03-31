import { ReducersMapObject } from '@reduxjs/toolkit';
import loginReducers from '../pages/Login/reducers/reducers';
import optionsReducers from '../pages/Options/reducers/reducers';
import miraiLoginReducers from '../pages/MiraiLogin/reducers/reducers';

/* reducers */
export const reducersMapObject: ReducersMapObject = Object.assign({},
  loginReducers,
  optionsReducers,
  miraiLoginReducers
);

export const ignoreOptions: any = {
  ignoredPaths: ['login.loginList', 'miraiLogin.childProcessWorker'],
  ignoredActions: [
    'login/setAddLogin',
    'login/setDeleteLogin',
    'miraiLogin/setChildProcessWorker'
  ]
};