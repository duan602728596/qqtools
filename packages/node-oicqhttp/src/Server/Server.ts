import * as http from 'node:http';
import type { Server as HttpServer, IncomingMessage } from 'node:http';
import type { Socket } from 'node:net';
import Koa from 'koa';
import type { Context, Next } from 'koa';
import Router from '@koa/router';
import { koaBody } from 'koa-body';
import { WebSocketServer, type WebSocket } from 'ws';
import type { Client } from 'oicq';
import type { ServerArgs, KoaFunction, PostActionBody } from './types.js';

/* Server */
class Server {
  port: number; // 端口号
  public app: Koa;
  public router: Router;
  public wsServer: WebSocketServer;
  public httpServer: HttpServer;
  client: Client;

  constructor(args: ServerArgs) {
    this.port = args.port ?? 15000;
    this.client = args.client;
    this.app = new Koa();       // koa服务
    this.router = new Router(); // koa-router
    this.wsServer = new WebSocketServer({ // websocket服务
      noServer: true,
      path: '/oicq/ws'
    });
  }

  // 通过接口触发事件
  postActionRouter: KoaFunction = async (ctx: Context, next: Next): Promise<void> => {
    try {
      const { type, payload }: PostActionBody = ctx.request.body;
      const args: Array<string> = payload ?? [];

      if (typeof this.client[type] === 'function') {
        if (Array.isArray(args)) {
          ctx.body = await this.client[type](...args);
        } else {
          ctx.status = 400;
          ctx.body = { retcode: 400, status: 'The type of the parameter "payload" is wrong, its type must be Array<any>.' };
        }
      } else {
        ctx.status = 400;
        ctx.body = { retcode: 400, status: 'Method type does not exist.' };
      }
    } catch (err) {
      ctx.status = 500;
      ctx.body = { retcode: 500, error: err };
    }
  };

  // http server upgrade
  handleHttpServerUpgrade: (req: IncomingMessage, sock: Socket, head: Buffer) => void
    = (req: IncomingMessage, sock: Socket, head: Buffer): void => {
      this.wsServer.handleUpgrade(req, sock, head, (connection: WebSocket): void => {
        if (!this.wsServer.shouldHandle(req)) {
          return;
        }

        this.wsServer.emit('connection', connection, req);
      });
    };

  // websocket connection
  handleWsServerConnection: (wsClient: WebSocket) => void = (wsClient: WebSocket): void => {
    console.log('websocket连接。');
    wsClient.on('close', (): void => {
      console.log('websocket断开。');
      wsClient.terminate();
    });
  };

  // oicq监听
  handleOicqEvent: (event: any) => void = (event: any): void => {
    this.wsServer.clients.forEach((client: WebSocket): void => {
      try {
        client.send(JSON.stringify(event));
      } catch (err) {
        console.error(err);
      }
    });
  };

  // http server error
  handleError: (err: Error) => void = (err: Error): void => console.error(err);

  // 初始化服务，包括创建中间件等
  init(): void {
    // post body
    this.app.use(koaBody());

    // router
    this.app.use(this.router.routes())
      .use(this.router.allowedMethods());

    // 接口
    this.router.post('/oicq/action', this.postActionRouter);

    // server
    this.httpServer = http.createServer(this.app.callback());

    // websocket
    this.httpServer.on('upgrade', this.handleHttpServerUpgrade);
    this.httpServer.on('error', this.handleError);
    this.wsServer.on('connection', this.handleWsServerConnection);
    this.wsServer.on('error', this.handleError);

    // oicq监听
    this.client.on('system', this.handleOicqEvent);
    this.client.on('message', this.handleOicqEvent);
    this.client.on('request', this.handleOicqEvent);
    this.client.on('notice', this.handleOicqEvent);

    this.httpServer.listen(this.port);
  }
}

export default Server;