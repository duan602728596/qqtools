import { Action } from 'redux';
import dbRedux, { objectStoreName } from '../../../function/dbInit/dbRedux';

export const saveFormData: (val: object) => Action = dbRedux.putAction({ objectStoreName });