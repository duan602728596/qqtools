import loadScript from '../../../utils/loadScript';

/* 头条mssdk */
let webmssdk: any;

export async function webmssdkES5(functionName: string, args: any[]): Promise<any> {
  if (!webmssdk) {
    await loadScript(require('./toutiaosdk-webmssdk.es5.js'), 'webmssdk');
    webmssdk = globalThis.webmssdk;
  }

  return webmssdk[functionName](...args);
}