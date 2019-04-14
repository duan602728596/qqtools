import IndexedDB from 'indexeddb-tools';
import IndexedDBRedux from 'indexeddb-tools-redux';
import option from '../option/option';

const { indexeddb } = option;

/* 初始化所有的数据库 */
IndexedDB(indexeddb.name, indexeddb.version, {
  success(event) {
    this.close();
  },
  upgradeneeded(event) {
    const objectStore = indexeddb.objectStore;

    for (let i = 0, j = objectStore.length; i < j; i++) {
      const { name, key, data } = objectStore[i];

      if (!this.hasObjectStore(name)) {
        this.createObjectStore(name, key, data);
      }
    }
    this.close();
  }
});

export const db = new IndexedDBRedux(indexeddb.name, indexeddb.version);