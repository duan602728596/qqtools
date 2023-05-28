import type { Browser, BrowserContext, Page, Route, Request, Cookie, JSHandle } from 'playwright-core';
import { getBrowser } from '../../../utils/utils';
import script from './script.js';

const xiaohongshuBody: string = `<html>
<head>
  <meta charset="utf8">
</head>
<body>
  <script>${ script }</script>
</body>
</html>`;

export interface SignResult {
  'X-s': string;
  'X-t': string;
}

/**
 * Encryption algorithm of Xiaohongshu request header. It returns x-s and x-t.
 * x-b3-traceid and x-s-common are also required in the header, but do not need to be calculated.
 *
 * How to use:
 *
 * console.log(
 *   await sign(executablePath, `/api/sns/web/v1/user_posted?num=30&cursor=&user_id=594099df82ec393174227f18`, undefined, cookie)
 * )
 *
 * @param { string } executablePath
 * @param { string } uri
 * @param { Record<string, unknown> | undefined } data
 * @param { string } cookie
 */
export async function sign(
  executablePath: string,
  uri: string,
  data: Record<string, unknown> | undefined,
  cookie: string | undefined
): Promise<SignResult> {
  const browser: Browser = await getBrowser(executablePath).launch({
    headless: true,
    executablePath,
    timeout: 0
  });
  const context: BrowserContext = await browser.newContext();
  const page: Page = await context.newPage();

  await page.route(
    (u: URL): boolean => /www\.xiaohongshu\.com/i.test(u.hostname),
    async function(route: Route, request: Request): Promise<void> {
      await route.fulfill({
        body: xiaohongshuBody
      });
    });

  if (typeof cookie === 'string') {
    await context.addCookies(
      cookie.split(/;\s*/).map((cs: string): Pick<Cookie, 'name' | 'value'> & { url: string } => {
        const [name, value]: string[] = cs.split(/\s*=\s*/);

        return { name, value, url: 'https://www.xiaohongshu.com/' };
      }));
  }

  await page.goto('https://www.xiaohongshu.com/user/profile/594099df82ec393174227f18', { timeout: 0 });
  await page.waitForLoadState('domcontentloaded', { timeout: 0 });
  const handle: JSHandle = await page.evaluateHandle(
    ([u, d]: [string, Record<string, unknown> | undefined]) => window['_webmsxyw'](u, d),
    [uri, data]);
  const result: SignResult = await handle.jsonValue();

  await page.close();
  await browser.close();

  return result;
}

/**
 * @param { string } executablePath
 */
export async function getCookie(executablePath: string): Promise<string | undefined> {
  let browser: Browser | null = null,
    page: Page | null = null;

  try {
    browser = await getBrowser(executablePath).launch({
      headless: true,
      executablePath,
      timeout: 0
    });
    const context: BrowserContext = await browser.newContext();

    page = await context.newPage();
    await page.route(
      (u: URL): boolean => /\.(png|j?peg|webp|avif|icon?|gif)/.test(u.pathname) || /\/webp/.test(u.href),
      async function(route: Route, request: Request): Promise<void> {
        await route.abort();
      });
    await page.goto('https://www.xiaohongshu.com/user/profile/594099df82ec393174227f18', { timeout: 0 });
    await page.waitForSelector('.user-name', { timeout: 60_000 * 5 });
    const cookie: string = ((await context.cookies()) ?? []).map((c: Cookie): string => `${ c.name }=${ c.value }`).join('; ');

    await page.close();
    await browser.close();

    return cookie;
  } catch (err) {
    await page?.close?.();
    await browser?.close?.();
  }
}