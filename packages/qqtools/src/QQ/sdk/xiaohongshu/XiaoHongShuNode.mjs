import fsP from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright-core';
import { metaHelper } from '@sweet-milktea/utils';

const { __dirname } = metaHelper(import.meta.url);
const scripts = await fsP.readFile(path.join(__dirname, 'XiaoHongShu.js'), { encoding: 'utf8' });

/**
 * Encryption algorithm of Xiaohongshu request header. It returns x-s and x-t.
 * x-b3-traceid and x-s-common are also required in the header, but do not need to be calculated.
 *
 * How to use:
 *
 * console.log(
 *   await sign(`/api/sns/web/v1/user_posted?num=30&cursor=&user_id=594099df82ec393174227f18`, undefined, cookie)
 * )
 *
 * @param { string } uri
 * @param { Record<string, unknown> | undefined } data
 * @param { string } cookie
 */
async function sign(uri, data, cookie) {
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    timeout: 0
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.route(
    (u) => /www\.xiaohongshu\.com/i.test(u.hostname),
    async function(route, request) {
      await route.fulfill({
        body: `<html>
<head>
  <meta charset="utf8">
</head>
<body>
  <script>${ scripts }</script>
</body>
</html>`
      });
    });

  if (typeof cookie === 'string') {
    await context.addCookies(cookie.split(/;\s*/).map((cs) => {
      const [name, value] = cs.split(/\s*=\s*/);

      return { name, value, url: 'https://www.xiaohongshu.com/' };
    }));
  }

  await page.goto('https://www.xiaohongshu.com/user/profile/594099df82ec393174227f18', { timeout: 0 });
  await page.waitForLoadState('domcontentloaded', { timeout: 0 });
  const handle = await page.evaluateHandle(
    ([u, d]) => window._webmsxyw(u, d),
    [uri, data]);

  const result = await handle.jsonValue();

  await page.close();
  await browser.close();

  return result;
}

export default sign;