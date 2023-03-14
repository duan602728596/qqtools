import * as https from 'node:https';
import * as http from 'node:http';
import type { IncomingMessage, ServerResponse, ClientRequest } from 'node:http';
import { workerData } from 'node:worker_threads';

const maxAge: number = 7 * 24 * 60 * 60;
const baseUrl: string = `http://localhost:${ workerData.port }`;

function response404NotFound(httpResponse: ServerResponse): void {
  httpResponse.statusCode = 404;
  httpResponse.end('404 not found.');
}

/**
 * 微博图片处理
 * @param { URL } urlParse
 * @param { ServerResponse } httpResponse
 */
function weiboResponseHandle(urlParse: URL, httpResponse: ServerResponse): void {
  const imageUrl: string | null = urlParse.searchParams.get('url');

  if (!imageUrl) return response404NotFound(httpResponse);

  const deImageUrl: string = decodeURIComponent(imageUrl);
  const deImageUrlParse: URL = new URL(deImageUrl);

  const req: ClientRequest = (deImageUrlParse.protocol === 'https:' ? https : http)
    .get(deImageUrl, { headers: { Referer: 'https://www.weibo.com/' } }, function(response: IncomingMessage): void {
      const buffer: Array<Buffer> = [];

      response.on('data', (chunk: Buffer): unknown => buffer.push(chunk));

      response.on('end', (): void => {
        httpResponse.setHeader('Content-type', response.headers['content-type'] ?? 'image/png');
        httpResponse.setHeader('Cache-Control', `max-age=${ maxAge }`);
        httpResponse.end(Buffer.concat(buffer));
      });

      response.on('error', (error: Error): void => {
        httpResponse.statusCode = response.statusCode ?? 400;
        httpResponse.end(null);
        console.error(`[Http response error] ${ deImageUrl }\n`, error, '\n');
      });
    });

  req.on('error', function(error: Error): void {
    httpResponse.statusCode = 400;
    httpResponse.end(null);
    console.error(`[Http request error] ${ deImageUrl }\n`, error, '\n');
  });
}

/* 开启代理服务 */
http.createServer(function(httpRequest: IncomingMessage, httpResponse: ServerResponse): void {
  if (!httpRequest.url) {
    return response404NotFound(httpResponse);
  }

  const urlParse: URL = new URL(httpRequest.url, baseUrl);

  if (urlParse.pathname === '/proxy/weibo/image') {
    weiboResponseHandle(urlParse, httpResponse);
  } else {
    response404NotFound(httpResponse);
  }
}).listen(workerData.port);