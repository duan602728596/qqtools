/* 房间信息监听相关 */
import { getProxyIp } from '../proxy/index';
const request = global.require('request');

// 配置项
const reqOption = {
  method: 'POST',
  json: true
};

function rStr(len) {
  const str = 'QWERTYUIOPASDFGHJKLZXCVBNM1234567890';
  let result = '';

  for (let i = 0; i < len; i++) {
    const rIndex = Math.floor(Math.random() * str.length);

    result += str[rIndex];
  }

  return result;
}

function createHeaders(token) {
  return {
    'Content-Type': 'application/json;charset=utf-8',
    appInfo: JSON.stringify({
      vendor: 'apple',
      deviceId: `${ rStr(8) }-${ rStr(4) }-${ rStr(4) }-${ rStr(4) }-${ rStr(12) }`,
      appVersion: '6.0.1',
      appBuild: '190420',
      osVersion: '11.4.1',
      osType: 'ios',
      deviceName: 'iPhone 6s',
      os: 'ios'
    }),
    'User-Agent': 'PocketFans201807/6.0.1 (iPhone; iOS 11.4.1; Scale/2.00)',
    'Accept-Language': 'zh-Hans-AW;q=1',
    Host: 'pocketapi.48.cn',
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
      timeout: 60000,
      proxy: getProxyIp()
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
      timeout: 20000,
      proxy: getProxyIp()
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
      timeout: 20000,
      proxy: getProxyIp()
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
      timeout: 20000,
      proxy: getProxyIp()
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
      timeout: 60000,
      proxy: getProxyIp()
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
 * 获取单个直播间的信息
 * @param { string } liveId
 */
export function getLiveInfo(liveId) {
  return new Promise((resolve, reject) => {
    request({
      uri: 'https://pocketapi.48.cn/live/api/v1/live/getLiveOne',
      method: 'POST',
      headers: createHeaders(),
      json: true,
      body: { liveId },
      proxy: getProxyIp()
    }, function(err, res, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

/**
 * 获取直播列表
 * @param { number } next
 * @param { boolean } inLive
 */
export function getLiveList(next = 0, inLive = false) {
  return new Promise((resolve, reject) => {
    const body = {
      debug: true,
      next
    };

    if (inLive) {
      body.groupId = 0;
      body.record = false;
    }

    request({
      uri: 'https://pocketapi.48.cn/live/api/v1/live/getLiveList',
      method: 'POST',
      headers: createHeaders(),
      json: true,
      body,
      proxy: getProxyIp()
    }, function(err, res, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}