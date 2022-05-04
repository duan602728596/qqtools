import { IDBReduxInstance, type IndexedDBRedux } from '@indexeddb-tools/indexeddb-redux';
import dbConfig, { type ObjectStoreItem } from './IDBConfig';

/* indexeddb redux */
const IDBRedux: IndexedDBRedux = IDBReduxInstance(dbConfig.name, dbConfig.version);
const objectStore: Array<ObjectStoreItem> = dbConfig.objectStore;

export const loginOptionsObjectStoreName: string = objectStore[0].name;
export const roomIdObjectStoreName: string = objectStore[1].name;
export const qqObjectStoreName: string = objectStore[2].name;
export default IDBRedux;