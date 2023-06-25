import type { ReducersMapObject, Middleware } from '@reduxjs/toolkit';
import loginReducers from '../pages/Login/reducers/reducers';
import optionsReducers from '../pages/Options/reducers/options';
import miraiLoginReducers from '../pages/MiraiLogin/reducers/miraiLogin';
import pocketFriendsApi from '../pages/Options/reducers/pocketFriends.api';

/* reducers */
export const reducersMapObject: ReducersMapObject = Object.assign({},
  loginReducers,
  optionsReducers,
  miraiLoginReducers,
  { [pocketFriendsApi.reducerPath]: pocketFriendsApi.reducer }
);

export const ignoreOptions: any = {
  ignoredPaths: ['login.loginList', 'miraiLogin.childProcessWorker'],
  ignoredActions: [
    'login/setAddLogin',
    'login/setDeleteLogin',
    'miraiLogin/setChildProcessWorker'
  ]
};

/* middlewares */
export const apiMiddlewares: Array<Middleware> = [
  pocketFriendsApi.middleware
];