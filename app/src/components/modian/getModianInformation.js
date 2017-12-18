const MD5 = node_require('md5.js');

/**
 * 获取摩点项目的相关信息
 * @param { string } modianId: 微打赏ID
 */
function getModianInformation(modianId: string): Promise{
  // 计算签名
  let data: string = `pro_id=${ modianId }`;
  const signStr: string = new MD5().update(data + '&p=das41aq6').digest('hex');
  const sign: string = signStr.substr(5, 16);
  data += `&sign=${ sign }`;
  return new Promise((resolve: Function, reject: Function): void=>{
    $.ajax({
      type: 'POST',
      url: `https://wds.modian.com/api/project/detail`,
      cache: true,
      data,
      dataType: 'json',
      success: function(data: string, status: string, xhr: XMLHttpRequest): void{
        const data2: Object = data.data[0];
        resolve({
          title: data2.pro_name,
          already_raised: data2.already_raised
        });
      },
      error: function(err: any): void{
        reject(err);
      }
    });
  });
}

export default getModianInformation;