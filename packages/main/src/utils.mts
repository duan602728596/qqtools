import { env, resourcesPath } from 'node:process';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as Module from 'node:module';

/* 模块帮助 */
export const nodeModulesRequire: NodeRequire = Module.createRequire(globalThis.__IMPORT_META_URL__ ?? import.meta.url);

export interface MetaHelperResult {
  __filename: string;
  __dirname: string;
}

export function metaHelper(metaUrl: string): MetaHelperResult {
  const filename: string = fileURLToPath(metaUrl);
  const dirname: string = path.dirname(filename);

  return { __filename: filename, __dirname: dirname };
}

const { __dirname }: MetaHelperResult = metaHelper(import.meta.url);

/* 判断是开发环境还是生产环境 */
export const isDevelopment: boolean = env.NODE_ENV === 'development';

/* 判断启动是否是serve的方式启动 */
export const isServe: boolean = env.SERVE === '1';

/* 文件夹路径 */
export const wwwPath: string = path.join(__dirname, '..');

/**
 * worker.js文件路径
 * 有asar文件：app.asar.unpacked
 * 无asar文件：app
 */
export const workerProductionBasePath: string = path.join(resourcesPath, 'app/boot');

/* 图标文件 */
export const titleBarIcon: string | undefined = isDevelopment ? undefined : path.join(wwwPath, 'titleBarIcon.png');

/**
 * html路径
 * @param { string } htmlName - 文件名
 */
export function createHtmlFilePath(htmlName: string): string {
  return isDevelopment
    ? path.join(wwwPath, `../qqtools/dist/${ htmlName }.html`)
    : path.join(wwwPath, `view/${ htmlName }.html`);
}

/**
 * html开发环境的url
 * @param { string } htmlName
 */
export function createHtmlUrl(htmlName: string): string {
  return `http://localhost:7654/${ htmlName }`;
}

/* 获取package.json文件的位置 */
export const packageJson: { version: string } = nodeModulesRequire(path.join(wwwPath, 'package.json'));

/* User-Agent */
export const pcUserAgent: string = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) '
  + 'Chrome/112.0.0.0 Safari/537.36 Edg/112.0.1722.68';