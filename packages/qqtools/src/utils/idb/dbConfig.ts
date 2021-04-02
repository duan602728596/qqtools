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
  version: 3,
  objectStore: [
    // 存储登陆配置
    {
      name: 'option',
      key: 'id',
      data: ['name', 'value']
    },

    // 一些系统配置
    {
      name: 'options',
      key: 'name',
      data: ['value']
    },

    // 账号登陆配置
    {
      name: 'qq',
      key: 'qq', // qq号
      data: ['lastLoginTime', 'password', 'autoLogin'] // 最后登陆时间、密码、是否自动登陆
    }
  ]
};

export default dbConfig;