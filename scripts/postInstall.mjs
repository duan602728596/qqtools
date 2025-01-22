import path from 'node:path';
import fsP from 'node:fs/promises';
import { cwd, command, npm } from './utils.mjs';

const nodeModules = path.join(cwd, 'node_modules');

/* 修复网易云信SDK */
async function replaceWebsocket(fp, ws) {
  const filePath = path.join(nodeModules, fp);
  const file = await fsP.readFile(filePath, { encoding: 'utf8' });
  const fixedComments = `/* ${ fp } fixed */`;
  const replaceValue = `${ fixedComments } window.${ ws }||window.WebSocket`;

  if (file.includes(fixedComments)) return;

  const newFile = file.replace(/window\.WebSocket/g, replaceValue);

  await fsP.writeFile(filePath, newFile, { encoding: 'utf8' });
}

/* 执行postinstall脚本 */
async function postInstall() {
  // 替换window.WebSocket
  await Promise.all([
    replaceWebsocket('nim-web-sdk-ng/dist/NIM_BROWSER_SDK.js', 'HACK_INTERCEPTS_SEND_NIM_Websocket'),
    replaceWebsocket('nim-web-sdk-ng/dist/QCHAT_BROWSER_SDK.js', 'HACK_INTERCEPTS_SEND_QCHAT_Websocket')
  ]);

  // 编译esm -> cjs
  await command(npm, ['run', 'build'], path.join(cwd, 'packages/esm-build'));
}

postInstall();