/* 帮助命令 */
import $ from 'jquery';

async function helpCb(qq: CoolQ): Promise<void> {
  const { basic, custom }: {
    basic: Object,
    custom: Object
  } = qq.option;

  if (!basic.isHelpCommend) {
    return void 0;
  }

  try {
    const text1: string = `【帮助】
  · [摩点 或 集资 或 mod]:查看当前微打赏链接
  · [(摩点 或 集资 或 mod) (0 或 项目信息)]:查看当前已集资数
  · [(摩点 或 集资 或 mod) (1 或 聚聚榜) ?number]:查看聚聚榜
  · [(摩点 或 集资 或 mod) (2 或 打卡榜) ?number]:查看打卡榜
  · [(摩点 或 集资 或 mod) (3 或 订单) ?number]:订单查询
  · [补卡 摩点ID number]:补卡
  · [查卡 (摩点ID 或 摩点昵称)]:查卡
  · [直播列表 或 zb]:查看当前的口袋48直播列表
  · [help]：帮助`;

    await qq.sendMessage(text1);

    if (Object.values(custom).length > 0) {
      let text2: string = '【自定义命令】';

      $.each(custom, (key: string, value: string): void => {
        text2 += '\n · ' + key;
      });

      await qq.sendMessage(text2);
    }

  } catch (err) {
    console.error(err);
  }
}

export default helpCb;