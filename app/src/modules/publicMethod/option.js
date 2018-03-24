/* 配置文件 */
const path: Object = global.require('path');
const process: Object = global.require('process');

const execPath: string = path.dirname(process.execPath).replace(/\\/g, '/');

type inforMap = {
  name: string,
  key: string,
  data: ?{
    name: string,
    index: string
  }[]
};

type indexeddbMap = {
  name: string,
  version: number,
  objectStore: inforMap[]
};

const option: {
  cache: string,
  indexeddb: indexeddbMap
} = {
  indexeddb: {                            // 配置indexedDB
    name: 'qqtools',
    version: 10,
    objectStore: [
      {
        // 机器人配置
        name: 'option',
        key: 'name',
        data: [
          {
            name: 'time',
            index: 'time'
          }
        ]
      },
      {
        // 成员id和相关信息
        name: 'memberId',
        key: 'memberId',
        data: [
          {
            name: 'memberName',
            index: 'memberName'
          }
        ]
      },
      {
        // 登录信息存储
        name: 'loginInformation',
        key: 'key'
      }
    ]
  }
};

export default option;