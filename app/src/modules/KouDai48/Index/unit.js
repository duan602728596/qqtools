const request = global.require('request');

// 格式化数组
export function format(rawArray: Array, from: number, to: number): Array{
  if(rawArray.length === 0){
    return [];
  }

  if(from === to){
    return [
      {
        memberId: rawArray[from]
      }
    ];
  }

  const middle: number = Math.floor((to - from) / 2) + from;
  const left: Array = format(rawArray, from, middle);
  const right: Array = format(rawArray, middle + 1, to);

  return left.concat(right);
}

// 请求头
const HEADERS: Object = {
  'os': 'android',
  'IMEI': '864394020501237',
  'version': '5.0.0',
  'Connection': 'Keep-Alive'
};

// 配置项
const reqOption: Object = {
  method: 'POST',
  headers: HEADERS,
  json: true
};

/**
 * 登录口袋48接口
 * @param { string } account : 用户名
 * @param { string } password: 密码
 */
export function login(account: string, password: string): Promise{
  return new Promise((resolve: Function, reject: Function)=>{
    request({
      ...reqOption,
      uri: 'https://puser.48.cn/usersystem/api/user/v1/login/phone',
      body: {
        password,
        account,
        longitude: 0,
        latitude: 0
      }
    }, (err: any, res: Object, body: Object): void=>{
      if(err){
        reject(err);
      }else{
        resolve(body);
      }
    });
  }).catch((err: Object): void=>{
    console.error(err);
  });
}

/**
 * 获取房间信息
 * @param { number } memberId: 用户名
 */
export function requestMemberInformation(memberId: number): Promise{
  return new Promise((resolve: Function, reject: Function)=>{
    request({
      ...reqOption,
      uri: 'https://puser.48.cn/usersystem/api/user/member/v1/fans/room',
      body: {
        memberId
      }
    }, (err: any, res: Object, body: Object): void=>{
      if(err){
        reject(err);
      }else{
        resolve(body);
      }
    });
  }).catch((err: Object): void=>{
    console.error(err);
  });
}