/**
 * 微博信息轮询查询
 */
let weiboUrl: string = 'https://m.weibo.cn/api/container/getIndex?containerid=';
let containerid: ?string = null;  // 微博的lfid
let lastId: ?number = null;       // 记录旧的ID
let timer: ?number = null;        // 定时器
const t: number = 1.5 * 60 * 10 ** 3;

addEventListener('message', async function(event: Event): Promise<boolean>{
  const data: Object = event.data;
  if(data.type === 'init'){
    containerid = data.containerid;
    weiboUrl = weiboUrl + containerid;

    // 初始化
    // 开启轮询
    await initId();
    timer = setInterval(polling, t);
    return true;
  }
  // 关闭
  if(data.type === 'cancel'){
    if(timer){
      clearInterval(timer);
    }
    return true;
  }
}, false);

// 轮询
async function polling(): Promise<void>{
  const res: Object = await getData('GET', weiboUrl);
  if(res.ok === 1){
    const cards: Array = res.data.cards;
    // 循环数据
    const newWeiBo: Object[] = [];
    for(let i: number = 0, j: number = cards.length; i < j; i++){
      const item: Object = cards[i];
      if(item.card_type === 9 && 'mblog' in item){
        if(!('title' in item.mblog)){
          if(Number(item.mblog.id) > lastId){
            newWeiBo.push(item);
          }else{
            break;
          }
        }
      }
    }
    // 构建发送数据

    if(newWeiBo.length > 0){
      lastId = Number(newWeiBo[0].mblog.id);
      const sendData: string[] = formatText(newWeiBo);
      postMessage({
        type: 'change',
        data: sendData
      });
    }
  }
}

// 获取初始ID
async function initId(): Promise<number>{
  const res: Object = await getData('GET', weiboUrl);
  const cards: Array = res.data.cards;
  if(res.ok === 1){
    for(let i: number = 0, j: number = cards.length; i < j; i++){
      const item: Object = cards[i];
      // 微博，不是关注人，不是置顶
      if(item.card_type === 9 && 'mblog' in item){
        if(!('title' in item.mblog)){
          lastId = Number(item.mblog.id);
          break;
        }
      }
    }
  }
}

// 发送数据构建
function formatText(newWeiBo: Object[]): string[]{
  const sendData: string = [];
  for(let i: number = 0, j: number = newWeiBo.length; i < j; i++){
    const item: Object = newWeiBo[i];
    const mblog: Object = item.mblog;
    const type: string = 'retweeted_status' in item.mblog ? '转载' : '原创';
    sendData.push(`${ mblog.user.screen_name } ` +
                  (mblog.created_at === '刚刚' ? mblog.created_at : ('在' + mblog.created_at)) +
                  `发送了一条微博：${ mblog.text.replace(/<[^<>]+>/g, '  ') }\n` +
                  `类型：${ type }\n` +
                  `地址：${ item.scheme }`);
  }
  return sendData;
}

/* ajax */
function getData(method: string, url: string){
  return new Promise((resolve: Function, reject: Function): void=>{
    const xhr: XMLHttpRequest = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Cache-Control', 'no-cache');
    xhr.addEventListener('readystatechange', function(event: Event): void{
      if(xhr.status === 200 && xhr.readyState === 4){
        const res: JSON = JSON.parse(xhr.response);
        resolve(res);
      }
    });
    xhr.send();
  });
}