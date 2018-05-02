/* 天气查询接口 */
import $ from 'jquery';
import { templateReplace } from '../../function';

function getTianQi(command: string[], qq: SmartQQ): void{
  $.ajax({
    type: 'GET',
    url: `https://api.seniverse.com/v3/weather/now.json?key=${ qq.option.basic.xinZhiTianQiAPIKey }&location=${ command[1] }&language=zh-Hans&unit=c`,
    cache: true,
    dataType: 'json',
    success(data: string, status: string, xhr: XMLHttpRequest): void{
      if('results' in data){
        const results: Array = data.results[0];
        const text: string = `【${ results.location.name }】\n天气：${ results.now.text }\n温度：${ results.now.temperature }℃`;
        qq.sendMessage(text);
      }else{
        qq.sendMessage(`[ERROR] ${ data.status_code }: ${ data.status }`);
      }
    },
    error(err: any): void{
      qq.sendMessage('[ERROR] 天气查询失败。');
    }
  });
}

function tianQiCb(command: string[], qq: SmartQQ): void{
  if(qq.option.basic.isXinZhiTianQi){
    getTianQi(command, qq);
  }else{
    qq.sendMessage('[WARNING] 天气查询功能未开启。');
  }
}

export default tianQiCb;