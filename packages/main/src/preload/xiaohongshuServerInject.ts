import * as http from 'node:http';
import type { IncomingMessage, ServerResponse } from 'node:http';

declare global {
  interface GlobalThis {
    __INIT_SIGN_SERVER__(port: number): void;
  }
}

globalThis.__INIT_SIGN_SERVER__ = function(port: number): void {
  const baseUrl: string = `http://localhost:${ port }`;

  function response404NotFound(httpResponse: ServerResponse): void {
    httpResponse.statusCode = 404;
    httpResponse.end('404 not found.');
  }

  function getPostBody(httpRequest: IncomingMessage): Promise<any> {
    return new Promise((resolve: Function, reject: Function): void => {
      const data: Array<Buffer> = [];

      httpRequest.on('data', function(d: Uint8Array): void {
        data.push(Buffer.from(d.buffer));
      });

      httpRequest.on('end', function(): void {
        resolve(JSON.parse(Buffer.concat(data).toString()));
      });
    });
  }

  http.createServer(async function(httpRequest: IncomingMessage, httpResponse: ServerResponse): Promise<void> {
    if (!httpRequest.url) {
      return response404NotFound(httpResponse);
    }

    const urlParse: URL = new URL(httpRequest.url, baseUrl);

    if (urlParse.pathname === '/xiaohongshu/sign') {
      const body: { url: string; data: any | undefined } = await getPostBody(httpRequest);

      httpResponse.statusCode = 200;
      httpResponse.setHeader('Content-type', 'application/json;charset=utf-8');
      httpResponse.end(JSON.stringify(window['_webmsxyw'](body.url, body.data)));
    } else {
      response404NotFound(httpResponse);
    }
  }).listen(port);
};