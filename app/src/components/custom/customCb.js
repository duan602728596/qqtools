// @flow
/* 自定义命令 */

function customCb(command: string, qq: SmartQQ): void{
  if(command in qq.option.custom){
    qq.sendFormatMessage(qq.option.custom[command]);
  }
}

export default customCb;