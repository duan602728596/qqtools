import $ from 'jquery';
import sign from './function/sign';

/**
 * 获取摩点项目的相关信息
 * @param { string } modianId: 摩点ID
 */
function getModianInformation(modianId) {
  // 计算签名
  const data = sign(`pro_id=${ modianId }`);

  return new Promise((resolve, reject) => {
    $.ajax({
      type: 'POST',
      url: 'https://wds.modian.com/api/project/detail',
      cache: true,
      data,
      dataType: 'json',
      success(data, status, xhr) {
        const data2 = data.data[0];

        resolve({
          title: data2.pro_name, // 标题
          already_raised: data2.already_raised, // 已打赏金额
          goal: data2.goal, // 目标
          backer_count: data2.backer_count, // 集资人数
          end_time: data2.end_time // 结束时间
        });
      },
      error(err) {
        reject(err);
      }
    });
  }).catch((err) => {
    console.error(err);
  });
}

export default getModianInformation;