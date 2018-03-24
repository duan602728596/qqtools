import IndexedDB from 'indexeddb-tools';
import IndexedDBRedux from 'indexeddb-tools-redux';
import option from './option';

/* 初始化所有的数据库 */
IndexedDB(option.indexeddb.name, option.indexeddb.version, {
  success(et: Object, event: Event): void{
    this.close();
  },
  upgradeneeded(et: Object, event: Event): void{
    const objectStore: Array = option.indexeddb.objectStore;

    for(let i: number = 0, j: number = objectStore.length; i < j; i++){
      const { name, key, data }: {
        name: string,
        key: string,
        data: ?Array
      } = objectStore[i];
      if(!this.hasObjectStore(name)){
        this.createObjectStore(name, key, data);
      }
    }
    this.close();
  }
});

export const db: IndexedDBRedux = new IndexedDBRedux(option.indexeddb.name, option.indexeddb.version);