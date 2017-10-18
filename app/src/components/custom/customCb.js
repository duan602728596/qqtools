// @flow
/* 自定义命令 */

function customCb(command: string[], qq: SmartQQ): void{
  if(command[1] in qq.option.custom){
    qq.sendFormatMessage(qq.option.custom[command[1]]);
  }
}

export default customCb;