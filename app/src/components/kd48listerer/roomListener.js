/* 房间信息监听相关 */
import moment from 'moment';
import { getProxyIp } from '../proxy/index';
const request = global.require('request');

// 配置项
const reqOption = { method: 'POST', json: true };

/**
 * 获取pa
 * @param { boolean } getNewPa: 获取新pa
 */
function getPa(getNewPa) {
  const pa = require('./pa'); // 找Lgyzero大佬申请token
  const paToken = localStorage.getItem('paToken');        // 记录pa
  const lastTime = localStorage.getItem('lastGetPaTime'); // 记录获取pa的时间戳（秒）
  const newTime = moment().unix(); // 当前时间戳（秒）

  if (getNewPa || !paToken || !lastTime || newTime - Number(lastTime) >= 1200) {
    return new Promise((resolve, reject) => {
      request({
        uri: `http://116.85.71.166:4848/getPA?userID=${ pa.userID }&token=${ pa.token }`,
        json: true
      }, (err, res, body) => {
        const content = body.content;

        localStorage.setItem('paToken', content);
        localStorage.setItem('lastGetPaTime', moment().unix());
        resolve(content);
      });
    });
  } else {
    return paToken;
  }
}

function rStr(len) {
  const str = 'QWERTYUIOPASDFGHJKLZXCVBNM1234567890';
  let result = '';

  for (let i = 0; i < len; i++) {
    const rIndex = Math.floor(Math.random() * str.length);

    result += str[rIndex];
  }

  return result;
}

async function createHeaders(token, getNewPa) {
  return {
    'Content-Type': 'application/json;charset=utf-8',
    appInfo: JSON.stringify({
      vendor: 'apple',
      deviceId: `${ rStr(8) }-${ rStr(4) }-${ rStr(4) }-${ rStr(4) }-${ rStr(12) }`,
      appVersion: '6.0.16',
      appBuild: '200701',
      osVersion: '13.5.1',
      osType: 'ios',
      deviceName: 'iPhone XR',
      os: 'ios'
    }),
    'User-Agent': 'PocketFans201807/6.0.16 (iPhone; iOS 13.5.1; Scale/2.00)',
    'Accept-Language': 'zh-Hans-AW;q=1',
    Host: 'pocketapi.48.cn',
    token,
    pa: await getPa(getNewPa)
  };
}

/**
 * 登录口袋48接口
 * @param { string } account : 用户名
 * @param { string } password: 密码
 */
export function login(account, password) {
  return new Promise(async (resolve, reject) => {
    request({
      ...reqOption,
      headers: await createHeaders(undefined, true),
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
  return new Promise(async (resolve, reject) => {
    request({
      ...reqOption,
      headers: await createHeaders(token),
      uri: 'https://pocketapi.48.cn/user/api/v1/friendships/friends/id',
      body: {},
      gzip: true,
      timeout: 30000,
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
  return new Promise(async (resolve, reject) => {
    request({
      uri: 'https://pocketapi.48.cn/im/api/v1/chatroom/msg/list/homeowner',
      method: 'POST',
      headers: await createHeaders(token),
      json: true,
      body: {
        needTop1Msg: false,
        roomId,
        nextTime: 0
      },
      gzip: true,
      timeout: 30000,
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
  return new Promise(async (resolve, reject) => {
    request({
      uri: 'https://pocketapi.48.cn/idolanswer/api/idolanswer/v1/question_answer/detail',
      method: 'POST',
      headers: await createHeaders(token),
      json: true,
      body: {
        questionId,
        answerId
      },
      gzip: true,
      timeout: 25000,
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
  return new Promise(async (resolve, reject) => {
    request({
      uri: 'https://pocketapi.48.cn/im/api/v1/conversation/page',
      method: 'POST',
      headers: await createHeaders(token),
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
  return new Promise(async (resolve, reject) => {
    request({
      uri: 'https://pocketapi.48.cn/live/api/v1/live/getLiveOne',
      method: 'POST',
      headers: await createHeaders(),
      json: true,
      body: { liveId },
      timeout: 60000,
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
  return new Promise(async (resolve, reject) => {
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
      headers: await createHeaders(),
      json: true,
      body,
      timeout: 60000,
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