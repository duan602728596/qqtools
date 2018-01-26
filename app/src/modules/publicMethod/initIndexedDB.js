import IndexedDB from 'indexeddb-tools';
import IndexedDBRedux from 'indexeddb-tools-redux';
import option from './option';

/* 初始化所有的数据库 */
IndexedDB(option.indexeddb.name, option.indexeddb.version, {
  success: function(et: Object, event: Event): void{
    this.close();
  },
  upgradeneeded: function(et: Object, event: Event): void{
    const objectStore: Array = option.indexeddb.objectStore;

    for(let i: number = 0, j: number = objectStore.length; i < j; i++){
      const item: Object = objectStore[i];
      const { name, key, data }: {
        name: string,
        key: string,
        data: ?Array
      } = item;
      if(!this.hasObjectStore(name)){
        this.createObjectStore(name, key, data)
      }
    }
    this.close();
  }
});

export const db = new IndexedDBRedux(option.indexeddb.name, option.indexeddb.version);