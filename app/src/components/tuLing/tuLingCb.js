// @flow
/* 机器人 */
import jQuery from 'jquery';

function getTuLing(command: string, qq: SmartQQ): void{
  jQuery.ajax({
    type: 'POST',
    url: `http://www.tuling123.com/openapi/api`,
    data: {
      key: qq.option.basic.tuLingAPIKey,
      info: command,
      userid: `user${ new Date().getTime() }`
    },
    dataType: 'json',
    success: function(data: string, status: number, xhr: XMLHttpRequest): void{
      if(data.code === 100000){
        let text: string = `${ data.text }`;
        if('url' in data){
          text += `\n${ data.url }`;
        }
        qq.sendFormatMessage(text);
      }else{
        qq.sendMessage(`[ERROR] ${ data.code }: ${ data.text }`);
      }
    },
    error: function(err: any): void{
      qq.sendMessage('[ERROR] 机器人返回数据失败。');
    }
  });
}

function tuLingCb(command: string, qq: SmartQQ): void{
  if(qq.option.basic.isXinZhiTianQi){
    getTuLing(command, qq);
  }else{
    qq.sendMessage('[WARNING] 机器人功能未开启。');
  }
}

export default tuLingCb;