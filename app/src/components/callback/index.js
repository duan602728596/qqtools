// @flow
/* 轮询的回调函数 */
import wdsCb from '../weiDaShang/wdsCb';
import kd48Cb from '../kd48listerer/kd48Cb';

function callback(result: Array | Object, qq: SmartQQ): void{
  if('result' in result){
    const type: string = result.result[0].poll_type;           // group_message
    const fromUin: number = result.result[0].value.from_uin;   // 监听群的uin
    const content: Array = result.result[0].value.content;     // index: 1 信息
    const msg_type: number = result.result[0].value.msg_type;  // 4
    const gid: number = qq.groupItem.gid;                      // 群的gid

    // 当群的uin和gid能够对上，且有消息时，获取命令
    if(type === 'group_message' && fromUin === gid && content[1] !== undefined){
      const command: string[] = content[1].split(/\s+/);
      // 格式化去掉空字符串
      for(let i = command.length - 1; i >= 0; i--){
        if(command[i] === ''){
          command.splice(i, 1);
        }  
      }
      fn(command, qq);
    }
  }
}

function fn(command: string[], qq: SmartQQ): void{
  switch(command[0]){
    // 微打赏判断
    case '微打赏':
    case 'wds':
      wdsCb(command, qq);
      break;
    // 口袋当前直播
    case '直播列表':
    case 'zb':
      kd48Cb(qq);
      break;
  }
}

export default callback;