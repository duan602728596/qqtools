import IndexedDBRedux from 'indexeddb-tools-redux';
import dbConfig, { ObjectStoreItem } from './dbConfig';

/* indexeddb redux */
const db: IndexedDBRedux = new IndexedDBRedux(dbConfig.name, dbConfig.version);
const objectStore: Array<ObjectStoreItem> = dbConfig.objectStore;

export const loginOptionsObjectStoreName: string = objectStore[0].name;
export const roomIdObjectStoreName: string = objectStore[1].name;
export const qqObjectStoreName: string = objectStore[2].name;
export default db;