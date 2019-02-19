/* 自定义命令 */

function customCb(command: string, qq: CoolQ): void {
  if (command[0] in qq.option.custom) {
    qq.sendMessage(qq.option.custom[command[0]]);
  }
}

export default customCb;