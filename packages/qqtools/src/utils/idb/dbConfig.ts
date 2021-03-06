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
  version: 2,
  objectStore: [
    // 存储登陆配置
    {
      name: 'option',
      key: 'id',
      data: ['name', 'value']
    },

    // 一些配置
    {
      name: 'options',
      key: 'name',
      data: ['value']
    }
  ]
};

export default dbConfig;