/* 帮助命令 */
import $ from 'jquery';

async function helpCb(qq: CoolQ): Promise<void>{
  const text1: string = `【帮助】
· [摩点 或 mod]:查看当前微打赏链接
· [(摩点 或 mod) (0 或 项目信息)]:查看当前已集资数
· [(摩点 或 mod) (1 或 聚聚榜) ?number]:查看聚聚榜
· [(摩点 或 mod) (2 或 打卡榜) ?number]:查看打卡榜
· [(摩点 或 mod) (3 或 订单) ?number]:订单查询
· [(查卡 或 cards) 摩点昵称]:抽卡查询
· [直播列表 或 zb]:查看当前的口袋48直播列表
· [(天气预报 或 tq) 城市]:查询天气情况
· [say 你想说的话]:机器人
· [help]：帮助`;

  let text2: string = '【自定义命令】';
  $.each(qq.option.custom, (key: string, value: string): void=>{
    text2 += '\n · ' + key;
  });

  await qq.sendMessage(text1);
  await qq.sendMessage(text2);
}

export default helpCb;