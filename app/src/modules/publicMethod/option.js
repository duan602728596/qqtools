/* 配置文件 */
const path = global.require('path');
const process = global.require('process');
const execPath = path.dirname(process.execPath).replace(/\\/g, '/');

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
  cache: `${ execPath }/.cache`,          // 文件缓存目录
  ptqr: `${ execPath }/.cache/ptqr.png`,  // 二维码
  indexeddb: {                            // 配置indexedDB
    name: 'qqtools',
    version: 4,
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
        key: 'memberId'
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