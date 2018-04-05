const fs: Object = global.require('fs');
const request: Function = global.require('request');

/* 读取文件 */
export function readFile(filePath: string): Promise<string>{
  return new Promise((resolve: Function, reject: Function): void=>{
    fs.readFile(filePath, (err: Error, data: ArrayBuffer): void=>{
      if(err){
        reject(err);
      }else{
        const s: string = data.toString();
        resolve(JSON.parse(s));
      }
    });
  }).catch((err: Error): void=>{
    console.error(err);
  });
}

/* 发送数据 */
export function bukaRequest(basic: Object, body: Object): Promise<void>{
  return new Promise((resolve: Function, reject: Function): void=>{
    request({
      uri: basic.choukaUrl,
      method: 'POST',
      json: true,
      body
    }, (err: Error, response: Object, body: Object): void=>{
      if(err){
        reject(err);
      }else{
        resolve({
          status: response.statusCode,
          message: body.message
        });
      }
    });
  }).catch((err: Error): void=>{
    console.error(err);
  });
}
