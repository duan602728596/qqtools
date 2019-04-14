/* 房间信息监听相关 */
const request = global.require('request');

// 请求头
const HEADERS = {
  os: 'android',
  IMEI: '864394020501237',
  version: '5.0.0',
  Connection: 'Keep-Alive'
};

// 配置项
const reqOption = {
  method: 'POST',
  headers: HEADERS,
  json: true
};

/**
 * 登录口袋48接口
 * @param { string } account : 用户名
 * @param { string } password: 密码
 */
export function login(account, password) {
  return new Promise((resolve, reject) => {
    request({
      ...reqOption,
      uri: 'https://puser.48.cn/usersystem/api/user/v1/login/phone',
      body: {
        password,
        account,
        longitude: 0,
        latitude: 0
      }
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
      uri: 'https://puser.48.cn/usersystem/api/user/member/v1/fans/room',
      body: {
        memberId
      }
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
 * 获取聚聚的相关信息
 * @param { number } userId: 用户的ID
 */
export function requestUserInformation(userId) {
  return new Promise((resolve, reject) => {
    request({
      ...reqOption,
      uri: `https://puser.48.cn/usersystem/api/user/v1/show/info/${ userId }`,
      body: {
        needRecommend: false,
        needChatInfo: false,
        needFriendsNum: false
      }
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
 * @param { number } roomId: 房间ID
 * @param { string } token : 登陆后得到的token
 * @param { number } limit : 返回的数据数量
 */
export function requestRoomMessage(roomId, token, limit = 1) {
  return new Promise((resolve, reject) => {
    request({
      uri: 'https://pjuju.48.cn/imsystem/api/im/v1/member/room/message/mainpage',
      method: 'POST',
      headers: {
        ...HEADERS,
        token
      },
      json: true,
      body: {
        roomId,
        chatType: 0,
        lastTime: 0,
        limit
      }
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