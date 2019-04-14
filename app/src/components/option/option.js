/* 配置文件 */
const option = {
  indexeddb: { // 配置indexedDB
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