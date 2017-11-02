/* 自定义命令 */

function customCb(command: string, qq: SmartQQ): void{
  if(command[0] in qq.option.custom){
    qq.sendFormatMessage(qq.option.custom[command[0]]);
  }
}

export default customCb;