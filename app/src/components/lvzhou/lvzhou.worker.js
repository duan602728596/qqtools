import moment from 'moment';

let lvzhouUrl = 'https://oasis.weibo.cn/v1/timeline/user';
let params = null;  // 参数
let headers = null; // headers
let timer = null;   // 定时器
let lastId = null;  // 记录旧的ID
const t = 1.5 * 60 * (10 ** 3);

/* ajax */
function getData(method, url) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open(method, url, true);

    // xhr.setRequestHeader('Content-Type', 'application/json');
    for (const key in headers) {
      xhr.setRequestHeader(key, headers[key]);
    }

    xhr.addEventListener('readystatechange', function(event) {
      if (xhr.status === 200 && xhr.readyState === 4) {
        const res = JSON.parse(xhr.response);

        resolve(res);
      }
    });
    xhr.send();
  }).catch((err) => {
    console.error(err);
  });
}

/* 获取初始ID */
async function initId() {
  try {
    const res = await getData('GET', lvzhouUrl);
    const statuses = res.data.statuses;

    if (res.code === 0 && statuses.length > 0) {
      lastId = statuses[0].id;
    }
  } catch (err) {
    console.error(err);
  }
}

// 发送数据构建
function formatText(newLvzhou) {
  const sendData = [];

  for (let i = 0, j = newLvzhou.length; i < j; i++) {
    const item = newLvzhou[i];
    let data = `${ item.user.name } 在${ moment(item.create_time).format('YYYY-MM-DD HH:mm:ss') }发送了一条动态。`;

    if (item.title && item.title !== '') {
      data += `\n标题：${ item.title }`;
    }

    if (item.text && item.text !== '') {
      data += `\n内容：${ item.text }`;
    }

    sendData.push({
      data,
      pics: (item.medias || []).map((item) => item.url)
    });
  }

  return sendData;
}

// 轮询
async function polling() {
  try {
    const res = await getData('GET', lvzhouUrl);

    if (res.code === 0) {
      const statuses = res.data.statuses;

      console.log('lvzhou', statuses);

      // 循环数据
      const newLvzhou = [];

      for (let i = 0, j = statuses.length; i < j; i++) {
        const item = statuses[i];

        if (item.id !== lastId) {
          newLvzhou.push(item);
        } else {
          break;
        }
      }

      // 构建发送数据
      if (newLvzhou.length > 0) {
        lastId = statuses[0].id;
        const sendData = formatText(newLvzhou);

        postMessage({
          type: 'change',
          data: sendData
        });
      }
    }
  } catch (err) {
    console.error(err);
  }
}

addEventListener('message', async function(event) {
  try {
    const data = event.data;

    if (data.type === 'init') {
      params = data.params;
      headers = data.headers;
      lvzhouUrl += `?${ params }`;

      // 初始化
      // 开启轮询
      await initId();
      timer = setInterval(polling, t);

      return true;
    }

    // 关闭
    if (data.type === 'cancel') {
      if (timer) {
        clearInterval(timer);
      }

      return true;
    }
  } catch (err) {
    console.error(err);
  }
}, false);