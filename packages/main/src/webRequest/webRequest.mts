import { session, type OnBeforeSendHeadersListenerDetails, type BeforeSendResponse } from 'electron';

function webRequest(): void {
  session.defaultSession.webRequest.onBeforeSendHeaders({
    urls: [
      'ws://*.netease.im:*/*',
      'wss://*.netease.im:*/*'
    ]
  }, function(details: OnBeforeSendHeadersListenerDetails, callback: (res: BeforeSendResponse) => void): void {
    const url: URL = new URL(details.url);
    const headers: Record<string, string> = { ...details.requestHeaders };

    if (/ws{1,2}:/i.test(url.protocol) && /netease\.im/i.test(url.hostname)) {
      /* 网易云信修改 */
      Object.assign(headers, {
        Origin: 'https://pocketapi.48.cn',
        'User-Agent': 'PocketFans201807/24020203'
      });
    }

    callback({ requestHeaders: headers });
  });
}

export default webRequest;