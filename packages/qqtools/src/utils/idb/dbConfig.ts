/* 数据库配置 */
export interface ObjectStoreItem {
  name: string;
  key: string;
  data: Array<string>;
}

export interface DbConfig {
  name: string;
  version: number;
  objectStore: Array<ObjectStoreItem>;
}

const dbConfig: DbConfig = {
  name: 'qqtools',
  version: 1,
  objectStore: [
    // 存储配置
    {
      name: 'option',
      key: 'id',
      data: ['name', 'value']
    }
  ]
};

export default dbConfig;