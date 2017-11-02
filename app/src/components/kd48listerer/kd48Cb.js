import jQuery from 'jquery';
import post from './post';
import { time } from '../../function';

async function getList(qq: Smart): void{
  const data = await post();
  const data2: Object = JSON.parse(data);

  let text: ?string = null;
  if(data2.status === 200){
    if('liveList' in data2.content && data2.content.liveList.length > 0){
      const { liveList }: { liveList: Array } = data2.content;

      text = `口袋48直播：（当前直播成员数：${ liveList.length }）`;
      jQuery.each(liveList, (index: number, item: Object): void=>{
        text += `\n${ index + 1 }、${ item.title.split('的')[0] }\n` +
          `标题：${ item.subTitle }\n` +
          `开始时间：${ time('YY-MM-DD hh:mm:ss', item.startTime) }`;
      });

    }else{
      text = '口袋48直播：\n当前无直播。';
    }
  }else{
    text = '[ERROR] 获取口袋48直播列表错误。\'';
  }
  await qq.sendFormatMessage(text);
}

function kd48Cb(qq: SmartQQ): void{
  if(qq.option.basic.is48LiveListener){
    getList(qq);
  }else{
    qq.sendMessage('[WARNING] 口袋48直播相关功能未开启。');
  }
}

export default kd48Cb;