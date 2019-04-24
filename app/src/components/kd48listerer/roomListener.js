/* 房间信息监听相关 */
const request = global.require('request');

// 配置项
const reqOption = {
  method: 'POST',
  json: true
};

function createHeaders(token) {
  return {
    'Content-Type': 'application/json;charset=utf-8',
    appInfo: JSON.stringify({
      vendor: 'apple',
      deviceId: `${ Math.floor(Math.random() * (10 ** 10)) }`,
      appVersion: '6.0.0',
      appBuild: '190409',
      osVersion: '11.4.1',
      osType: 'ios',
      deviceName: 'iPhone 6s',
      os: 'ios'
    }),
    token
  };
}

/**
 * 登录口袋48接口
 * @param { string } account : 用户名
 * @param { string } password: 密码
 */
export function login(account, password) {
  return new Promise((resolve, reject) => {
    request({
      ...reqOption,
      headers: createHeaders(),
      uri: 'https://pocketapi.48.cn/user/api/v1/login/app/mobile',
      body: {
        mobile: account,
        pwd: password
      },
      gzip: true,
      timeout: 60000
    }, (err, res, body) => {
      if (err) {
        reject(err);
      } else {
        resolve(body);
      }
    });
  }).catch((err) => {
    console.error(err);
  });
}

/**
 * 获取朋友的id
 * @param { string } token
 */
export function getFriendsId(token) {
  return new Promise((resolve, reject) => {
    request({
      ...reqOption,
      headers: createHeaders(token),
      uri: 'https://pocketapi.48.cn/user/api/v1/friendships/friends/id',
      body: {},
      gzip: true,
      timeout: 15000
    }, (err, res, body) => {
      if (err) {
        reject(err);
      } else {
        resolve(body);
      }
    });
  }).catch((err) => {
    console.error(err);
  });
}

/**
 * 获取成员的相关信息
 * @param { number } memberId: 成员的ID
 */
export function requestMemberInformation(memberId) {
  return new Promise((resolve, reject) => {
    request({
      ...reqOption,
      uri: 'https://pocketapi.48.cn/user/api/v1/user/info/home',
      headers: createHeaders(),
      body: {
        userId: memberId
      },
      gzip: true,
      timeout: 15000
    }, (err, res, body) => {
      if (err) {
        reject(err);
      } else {
        resolve(body);
      }
    });
  }).catch((err) => {
    console.error(err);
  });
}

/**
 * 获取房间信息
 * @param { number } roomId : 房间ID
 * @param { string } token  : 登陆后得到的token
 */
export function requestRoomMessage(roomId, token) {
  return new Promise((resolve, reject) => {
    request({
      uri: 'https://pocketapi.48.cn/im/api/v1/chatroom/msg/list/homeowner',
      method: 'POST',
      headers: createHeaders(token),
      json: true,
      body: {
        needTop1Msg: false,
        roomId,
        nextTime: 0
      },
      gzip: true,
      timeout: 15000
    }, (err, res, body) => {
      if (err) {
        reject(err);
      } else {
        resolve(body);
      }
    });
  }).catch((err) => {
    console.error(err);
  });
}

/**
 * 获取翻牌信息
 * @param { string } token : 登陆后得到的token
 * @param { number } questionId: 问题id
 * @param { number } answerId: 回答id
 */
export function requestFlipAnswer(token, questionId, answerId) {
  return new Promise((resolve, reject) => {
    request({
      uri: 'https://pocketapi.48.cn/idolanswer/api/idolanswer/v1/question_answer/detail',
      method: 'POST',
      headers: createHeaders(token),
      json: true,
      body: {
        questionId,
        answerId
      },
      gzip: true,
      timeout: 15000
    }, (err, res, body) => {
      if (err) {
        reject(err);
      } else {
        resolve(body); // content.answer
      }
    });
  }).catch((err) => {
    console.error(err);
  });
}

/**
 * 获取房间信息列表
 */
export function requestRoomPage(token) {
  return new Promise((resolve, reject) => {
    request({
      uri: 'https://pocketapi.48.cn/im/api/v1/conversation/page',
      method: 'POST',
      headers: createHeaders(token),
      json: true,
      body: { targetType: 0 },
      gzip: true,
      timeout: 60000
    }, (err, res, body) => {
      if (err) {
        reject(err);
      } else {
        resolve(body);
      }
    });
  }).catch((err) => {
    console.error(err);
  });
}