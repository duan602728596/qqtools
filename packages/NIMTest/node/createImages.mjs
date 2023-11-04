import fs, { promises as fsP } from 'node:fs';
import path from 'node:path';
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
    headless: false,
    executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
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
    html.push(`<div class="title">${ group }</div>
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

    for (const item of roomId.roomId.filter((o) => (o.team ?? '') === group)) {
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
          padding: 4px 6px;
          border: 1px solid #000;
          text-align: left;
        }
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

  await createHtml(order[0], 1);
  await createHtml(order[1], 2);
  await createHtml(order[2], 3);
  await createHtml(order[3], 4);
  await createHtml(order[4], 5);
  await createHtml(order[5], 6);
  await createHtml(order[6], 7);
}

createImages();