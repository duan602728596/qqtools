import path from 'path';
import { promises as fsPromise } from 'fs';
import puppeteer from 'puppeteer-core';
import { metaHelper } from '@sweet-milktea/utils';

const { __dirname } = metaHelper(import.meta.url);

/**
 * 浏览器的可执行文件
 * 运行前请配置
 */
const executablePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

/**
 * 需要替换该滑块地址
 */
const verifyUri = 'https://ti.qq.com/safe/verify?';

// 修改脚本
const qqapiFile = await fsPromise.readFile(path.join(__dirname, 'qqapi.wk.js'), {
  encoding: 'utf8'
});
const qqapiReplaceFile = qqapiFile.replace(
  'try{window.webkit.messageHandlers.jsapi.postMessage(',
  'try{__webkit_postMessage__('
);

function __webkit_postMessage__(data) {
  const uri = decodeURIComponent(data.src.split('?p=')[1])
    .replace('jsbridge://nav/openLinkInNewWebView,', '')
    .replace(/#[0-9]+$/, '');
  const json = JSON.parse(uri);

  if ('url' in json) {
    window.open(json.url);
  }
}

// 运行脚本
const browser = await puppeteer.launch({
  headless: false,
  devtools: false,
  executablePath
});
const page = await browser.newPage();

await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/18F72 QQ/8.8.0.608 V1_IPH_SQ_8.8.0_1_APP_A Pixel/828 SimpleUISwitch/0 StudyMode/0 QQTheme/1000 Core/WKWebView Device/Apple(iPhone XR) NetType/WIFI QBWebViewType/1 WKType/1');

await page.setCacheEnabled(false);
await page.setRequestInterception(true);
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