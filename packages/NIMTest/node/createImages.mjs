import fs, { promises as fsP } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { chromium } from 'playwright-core';
import { metaHelper } from '@sweet-milktea/utils';
import roomId from './roomId.json' assert { type: 'json' };

const { __dirname } = metaHelper(import.meta.url);

const order = [
  [
    'TEAM SII',
    'TEAM NII',
    'TEAM HII',
    'TEAM X'
  ],
  [
    'TEAM B',
    'TEAM E',
    // 'TEAM J',
    'BEJ48'
  ],
  [
    'TEAM G',
    'TEAM NIII',
    'TEAM Z'
  ],
  [
    'TEAM C',
    'TEAM K',
    'CKG48'
  ],
  [
    'TEAM CII',
    'TEAM GII'
  ],
  [
    '预备生',
    'IDFT'
  ],
  [
    '荣誉毕业生',
    '',
    '丝芭影视'
  ]
];
const imagesPath = path.join(__dirname, '../images');

async function createOneImage(file, output) {
  let browser = await chromium.launch({
    headless: true,
    executablePath: os.platform() === 'win32'
      ? 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
      : '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    timeout: 0
  });
  const context = await browser.newContext({
    viewport: {
      width: 660,
      height: 800
    }
  });
  const page = await context.newPage();

  await page.goto('file://' + file);
  await page.screenshot({ path: output, fullPage: true });
  await browser.close();
  browser = null;
}

async function createHtml(groups, output) {
  const html = [];

  for (const group of groups) {
    const teams = roomId.roomId.filter((o) => (o.team ?? '') === group);

    html.push(`<div class="title">${ group || '其他' }（${ teams.length }人）</div>
<div class="view">
<table class="table">
  <thead>
    <tr>
      <th>ID</th>
      <th>姓名</th>
      <th>ServerId</th>
      <th>ChannelId</th>
      <th>liveRoomId</th>
    </tr>
  </thead>
<tbody>`);

    for (const item of teams) {
      html.push(`<tr>
  <td>${ item.id }</td>
  <td>${ item.ownerName }</td>
  <td>${ item.serverId ?? '' }</td>
  <td>${ item.channelId ?? '' }</td>
  <td>${ item.liveRoomId ?? '' }</td>
</tr>`);
    }

    html.push('</tbody></table></div>');
  }

  html.push(`<time class="time">最后更新时间：${ roomId.buildTime }</time>`);

  await fsP.writeFile(path.join(imagesPath, `${ output }.html`), `<html>
<head>
  <meta charset="utf8">
  <style>
    body {
      margin: 0;
    }

    .title {
      padding: 8px 0 8px 4px;
      font-size: 16px;
    }

    .view {
      padding: 0;
    }

    .table {
      width: 660px;
      border-collapse: collapse;
      font-size: 14px;

      & th, & td {
        width: 20%;
        padding: 4px 6px;
        border: 1px solid #000;
      }
    }

    .time {
      display: block;
      margin-right: 4px;
      font-size: 12px;
      padding: 8px;
      text-align: right;
    }
  </style>
</head>
<body>
${ html.join('') }
</body>
</html>`);
  await createOneImage(path.join(imagesPath, `${ output }.html`), path.join(imagesPath, `${ output }.png`));
}

async function createImages() {
  if (!fs.existsSync(imagesPath)) {
    await fsP.mkdir(imagesPath);
  }

  await createHtml(order.flat(), 'roomId');
}

createImages();