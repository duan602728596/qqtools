/* 帮助命令 */
async function helpCb(qq: SmartQQ): Promise<void>{
  const text1: string = `【帮助】
· [摩点 或 mod]:查看当前微打赏链接
· [(摩点 或 mod) 0]:查看当前已集资数
· [(摩点 或 mod) 1 ?number]:查看聚聚榜
· [(摩点 或 mod) 2 ?number]:查看打卡榜
· [(摩点 或 mod) 3 ?number]:订单查询
· [直播列表 或 zb]:查看当前的口袋48直播列表
· [(天气预报 或 tq) 城市]:查询天气情况
· [say 你想说的话]:机器人
· [help]：帮助`;

  let text2: string = '【自定义命令】';
  $.each(qq.option.custom, (key: string, value: string): void=>{
    text2 += '\n · ' + key;
  });

  await qq.sendFormatMessage(text1);
  await qq.sendFormatMessage(text2);
}

export default helpCb;