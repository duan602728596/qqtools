import $ from 'jquery';
import post from './post';
import { time } from '../../utils';

async function getList(qq) {
  try {
    const data = await post();
    const data2 = JSON.parse(data);

    let text = null;

    if (data2.status === 200) {
      if ('liveList' in data2.content && data2.content.liveList.length > 0) {
        const { liveList } = data2.content;

        text = `口袋48直播：（当前直播成员数：${ liveList.length }）`;
        $.each(liveList, (index, item) => {
          text += `\n${ index + 1 }、${ item.title.split('的')[0] }\n`
                + `标题：${ item.subTitle }\n`
                + `开始时间：${ time('YY-MM-DD hh:mm:ss', item.startTime) }`;
        });
      } else {
        text = '口袋48直播：\n当前无直播。';
      }
    } else {
      text = '[ERROR] 获取口袋48直播列表错误。\'';
    }
    await qq.sendMessage(text);
  } catch (err) {
    console.error(err);
  }
}

function kd48Cb(qq) {
  if (!qq.option.basic.is48LiveListener) return void 0;

  getList(qq);
}

export default kd48Cb;