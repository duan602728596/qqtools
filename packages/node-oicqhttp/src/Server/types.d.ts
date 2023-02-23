import type { Context, Next } from 'koa';
import type { Client } from 'oicq';

export interface ServerArgs {
  port: number;
  client: Client;
}

export type KoaFunction = (ctx: Context, next: Next) => Promise<void>;

export interface PostActionBody {
  type: string;
  payload: Array<any>;
}