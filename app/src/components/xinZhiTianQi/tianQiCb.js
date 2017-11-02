/* 天气查询接口 */
import jQuery from 'jquery';
import { templateReplace } from '../../function';

function getTianQi(command: string[], qq: SmartQQ): void{
  jQuery.ajax({
    type: 'GET',
    url: `https://api.seniverse.com/v3/weather/now.json?key=${ qq.option.basic.xinZhiTianQiAPIKey }&location=${ command[1] }&language=zh-Hans&unit=c`,
    cache: true,
    dataType: 'json',
    success: function(data: string, status: number, xhr: XMLHttpRequest): void{
      if('results' in data){
        const results: Array = data.results[0];
        const text: string = templateReplace(qq.option.basic.xinZhiTianQiTemplate, {
          city: results.location.name,
          text: results.now.text,
          temperature: results.now.temperature
        });
        qq.sendFormatMessage(text);
      }else{
        qq.sendMessage(`[ERROR] ${ data.status_code }: ${ data.status }`);
      }
    },
    error: function(err: any): void{
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