// @flow
/* 帮助命令 */
import jQuery from 'jquery';

async function helpCb(qq: SmartQQ): void{

  let text1: string = `【帮助】
[微打赏 或 wds]：查看当前微打赏链接
[(微打赏 或 wds) 1 ?number]：查看当前的聚聚榜
[(微打赏 或 wds) 2 ?number]：查看当前的打卡榜
[直播列表 或 zb]：查看当前的口袋48直播列表
[(天气预报 或 tq) 城市]：查询天气情况
[say 你想说的话]：机器人
[--help]：帮助`;

  let text2: string = `【自定义命令】`;
  jQuery.each(qq.option.custom, (key: string, value: string): void=>{
    text2 += key;
  });

  await qq.sendFormatMessage(text1);
  await qq.sendFormatMessage(text2);

}

export default helpCb;