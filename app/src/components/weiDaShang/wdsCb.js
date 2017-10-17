/* 微打赏监听回调函数 */
import jQuery from 'jquery';
import { templateReplace } from '../../function';

// pro_id type page pageSize
function getData(data: Object): Promise{
  return new Promise((resolve: Function, reject: Function): void=>{
    jQuery.ajax({
      url: `https://wds.modian.com/ajax_backer_list`,
      data,
      dataType: 'json',
      type: 'POST',
      success: function(data: Object, status: number, xhr: XMLHttpRequest): void{
        resolve(data);
      }
    });
  });
}

function wdsCb(command: string[], qq: SmartQQ): void{
  if(qq.option.basic.isWds){
    // 微打赏功能开启
    switch(command[1]){
      // 获取聚聚榜
      case '1':
        juju(qq.option.basic.wdsId, command[1], command[2], qq);
        break;
      // 获取打卡榜
      case '2':
        daka(qq.option.basic.wdsId, command[1], command[2], qq);
        break;
      // 发送微打赏相关信息
      default:
        sendWdsInfor(qq);
        break;
    }
  }else{
    // 微打赏功能未开启
    qq.sendMessage('[WARNING]微打赏相关功能未开启。');
  }
}

// 发送信息
async function sendWdsInfor(qq: SmartQQ): void{
  const text: string = templateReplace(qq.option.basic.wdsUrlTemplate, {
    wdsname: qq.wdsTitle,
    wdsid: qq.option.basic.wdsId
  });
  await qq.sendFormatMessage(text);
}

// 聚聚榜
async function juju(proId: string, type: string, size: string, qq: SmartQQ):void{
  const x: number = Number(size);
  const pageSize: number = isNaN(x) ? 10 ** 10 : x;
  const data: Object = await getData({
    pro_id: proId,
    type,
    page: 1,
    pageSize: pageSize
  });
  if(data.status === '0'){
    // nickname
    // total_back_amount
    let txt: string = `【${ qq.wdsTitle }】\n聚聚榜，前${ data.data.length }名。`;
    jQuery.each(data.data, (index: number, item: Object): void=>{
      txt += `\n${ index + 1 }: ${ item.nickname } ￥${ String(item.total_back_amount.toFixed(2)) }`;
    });
    await qq.sendFormatMessage(txt);
  }else{
    await qq.sendMessage('[ERROR]获取微打赏聚聚榜错误。');
  }
}

// 打卡榜
async function daka(proId: string, type: string, size: string, qq: SmartQQ):void{
  const x: number = Number(size);
  const pageSize: number = isNaN(x) ? 10 ** 10 : x;
  const data: Object = await getData({
    pro_id: proId,
    type,
    page: 1,
    pageSize: pageSize
  });
  if(data.status === '0'){
    // nickname
    // total_back_amount
    let txt: string = `【${ qq.wdsTitle }】\n打卡榜，前${ data.data.length }名。`;
    jQuery.each(data.data, (index: number, item: Object): void=>{
      txt += `\n${ index + 1 }: ${ item.nickname } ${ item.total_back_days }天`;
    });
    await qq.sendFormatMessage(txt);
  }else{
    await qq.sendMessage('[ERROR]获取微打赏打卡榜错误。');
  }
}

export default wdsCb;