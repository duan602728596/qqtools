import $ from 'jquery';
import post from './post';
import { time } from '../../utils';

async function getList(qq) {
  try {
    const data = await post(0, true);
    let text = null;

    if (data.status === 200) {
      if ('liveList' in data.content && data.content.liveList.length > 0) {
        const { liveList } = data.content;

        text = `口袋48直播：（当前直播成员数：${ liveList.length }）`;
        $.each(liveList, (index, item) => {
          text += `\n${ index + 1 }、${ item.userInfo.nickname }\n`
                + `标题：${ item.title }\n`
                + `开始时间：${ time('YY-MM-DD hh:mm:ss', Number(item.ctime)) }`;
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