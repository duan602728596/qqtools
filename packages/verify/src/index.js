import path from 'node:path';
import { promises as fsP } from 'node:fs';
import puppeteer from 'puppeteer-core';
import { metaHelper } from '@sweet-milktea/utils';

const { __dirname } = metaHelper(import.meta.url);

/**
 * 需要替换该地址！
 */
const verifyUri = 'https://ti.qq.com/safe/verify?';

/**
 * 浏览器的可执行文件
 * 运行前请配置！
 */
const executablePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

/**
 * 读取并修改脚本，改为自己实现的方法
 */
const qqapiFile = await fsP.readFile(path.join(__dirname, 'qqapi.wk.js'), {
  encoding: 'utf8'
});
const qqapiReplaceFile = qqapiFile.replace(
  'try{window.webkit.messageHandlers.jsapi.postMessage(',
  'try{__webkit_postMessage__('
);

/**
 * 注入自己实现的打开新窗口的方法
 * @param { object } data
 */
function __webkit_postMessage__(data) {
  const uri = decodeURIComponent(data.src.split('?p=')[1])
    .replace('jsbridge://nav/openLinkInNewWebView,', '')
    .replace(/#[0-9]+$/, '');
  const json = JSON.parse(uri);

  if ('url' in json) {
    window.open(json.url);
  }
}

/**
 * 运行无头浏览器
 */
const browser = await puppeteer.launch({
  headless: false,
  devtools: false,
  executablePath
});
const page = await browser.newPage();
const qqUserAgent = `Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko)
 Mobile/18F72 QQ/8.8.0.608 V1_IPH_SQ_8.8.0_1_APP_A Pixel/828 SimpleUISwitch/0 StudyMode/0 QQTheme/1000 Core/WKWebView
  Device/Apple(iPhone XR) NetType/WIFI QBWebViewType/1 WKType/1`;

await page.setUserAgent(qqUserAgent.replaceAll(/\n/g, ''));
await page.setCacheEnabled(false);
await page.setRequestInterception(true);

// 拦截脚本并替换为自己的脚本
page.on('request', async function(req) {
  if (/qqapi\.wk/i.test(req.url())) {
    await req.respond({
      status: 200,
      contentType: 'application/javascript; charset=utf-8',
      body: `${ __webkit_postMessage__.toString() }${ qqapiReplaceFile }`
    });
  } else {
    await req.continue();
  }
});

await page.goto(verifyUri, {
  timeout: 0,
  referer: verifyUri
});