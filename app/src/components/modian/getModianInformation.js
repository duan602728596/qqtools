import sign from './function/sign';

/**
 * 获取摩点项目的相关信息
 * @param { string } modianId: 摩点ID
 */
function getModianInformation(modianId: string): Promise{
  // 计算签名
  const data: string = sign(`pro_id=${ modianId }`);
  return new Promise((resolve: Function, reject: Function): void=>{
    $.ajax({
      type: 'POST',
      url: 'https://wds.modian.com/api/project/detail',
      cache: true,
      data,
      dataType: 'json',
      success(data: string, status: string, xhr: XMLHttpRequest): void{
        const data2: Object = data.data[0];
        resolve({
          title: data2.pro_name,                 // 标题
          already_raised: data2.already_raised,  // 已打赏金额
          goal: data2.goal                       // 目标
        });
      },
      error(err: any): void{
        reject(err);
      }
    });
  });
}

export default getModianInformation;