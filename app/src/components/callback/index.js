/* 轮询的回调函数 */
import modianCb from '../modian/modianCb';
import kd48Cb from '../kd48listerer/kd48Cb';
import customCb from '../custom/customCb';
import helpCb from '../help/helpCb';

function callback(dataJson: Object, qq: CoolQ): void{
  const content: string = dataJson?.raw_message || dataJson.message;
  const command: string[] = content.split(/\s+/);
  // 格式化去掉空字符串
  for(let i: number = command.length - 1; i >= 0; i--){
    if(command[i] === ''){
      command.splice(i, 1);
    }
  }
  fn(command, qq);
}

function fn(command: string[], qq: CoolQ): void{
  switch(command[0]){
    // 摩点判断
    case '摩点':
    case '集资':
    case 'mod':
      modianCb(command, qq);
      break;
    // 口袋当前直播
    case '直播列表':
    case 'zb':
      kd48Cb(qq);
      break;
    // 帮助
    case 'help':
      helpCb(qq);
      break;
    // 其他自定义命令
    default:
      customCb(command, qq);
      break;
  }
}

export default callback;