import { session, type OnBeforeSendHeadersListenerDetails, type BeforeSendResponse } from 'electron';

/* 拦截抖音的请求，并修改header */
function douyinRequestInit(): void {
  session.defaultSession.webRequest.onBeforeSendHeaders({
    urls: ['*://www.douyin.com/*']
  }, function(details: OnBeforeSendHeadersListenerDetails, callback: (res: BeforeSendResponse) => void): void {
    const { requestHeaders }: OnBeforeSendHeadersListenerDetails = details;
    const { cookie0: cookie, secuserid0: secUserId, ua0: userAgent }: Record<string, string> = requestHeaders;

    callback({
      requestHeaders: {
        ...requestHeaders,
        Host: 'www.douyin.com',
        Cookie: cookie,
        Referer: `https://www.douyin.com/user/${ secUserId }`,
        'User-Agent': userAgent
      }
    });
  });
}

export default douyinRequestInit;