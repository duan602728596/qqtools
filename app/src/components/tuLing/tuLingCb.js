/* 机器人 */

function getTuLing(command: string[], qq: CoolQ): void{
  $.ajax({
    type: 'POST',
    url: 'http://www.tuling123.com/openapi/api',
    data: {
      key: qq.option.basic.tuLingAPIKey,
      info: command[1],
      userid: `user${ new Date().getTime() }`
    },
    dataType: 'json',
    success(data: string, status: string, xhr: XMLHttpRequest): void{
      let text: string = `${ data.text }`;
      if('url' in data){
        text += `\n${ data.url }`;
      }
      qq.sendMessage(text);
    },
    error(err: any): void{
      qq.sendMessage('[ERROR] 机器人返回数据失败。');
    }
  });
}

function tuLingCb(command: string[], qq: CoolQ): void{
  if(qq.option.basic.isXinZhiTianQi){
    getTuLing(command, qq);
  }else{
    qq.sendMessage('[WARNING] 机器人功能未开启。');
  }
}

export default tuLingCb;