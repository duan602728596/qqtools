const MD5 = global.require('md5.js');

/**
 * 摩点请求加密方法
 * @param { string } queryStr
 */
const P = 'das41aq6';

function sign(queryStr) {
  const signStr = new MD5().update(queryStr + '&p=' + P).digest('hex');
  const sign = signStr.substr(5, 16);

  return queryStr + `&sign=${ sign }`;
}

export default sign;