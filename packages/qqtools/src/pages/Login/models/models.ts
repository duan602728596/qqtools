import { createAction, handleActions, ActionFunctionAny } from 'redux-actions';
import type { AnyAction, ActionCreator } from 'redux';
import { fromJS, Map as IMap, List } from 'immutable';
import dbRedux, { objectStoreName } from '../../../function/dbInit/dbRedux';

export default {};