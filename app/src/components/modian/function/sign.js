const MD5: Object = global.require('md5.js');

/**
 * 摩点请求加密方法
 * @param { string } queryStr
 */
const P: string = 'das41aq6';

function sign(queryStr: string): void{
  const signStr: string = new MD5().update(queryStr + '&p=' + P).digest('hex');
  const sign: string = signStr.substr(5, 16);
  return queryStr + `&sign=${ sign }`;
}

export default sign;