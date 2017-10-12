// @flow
/* 轮询的回调函数 */

async function callback(result: Array | Object, qq: SmartQQ): void{
  if('result' in result){
    const type: string = result.result[0].poll_type;           // group_message
    const fromUin: number = result.result[0].value.from_uin;
    const content: Array = result.result[0].value.content;     // index: 1 信息
    const msg_type: number = result.result[0].value.msg_type;  // 4
    const gid: number = qq.groupItem.gid;                      // 群的gid
  }
}

export default callback;