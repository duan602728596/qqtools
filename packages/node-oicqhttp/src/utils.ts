import * as process from 'node:process';
import { metaHelper } from '@sweet-milktea/utils';

// 是否为开发环境
export const isDevelopment: boolean = process.env.NODE_ENV === 'development';

export const { __dirname }: { __dirname: string } = metaHelper(import.meta.url);

// import
export function dynamicImport<T>(filePath: string): Promise<T> {
  // eslint-disable-next-line no-new-func
  const f: Function = new Function(`return import(\`${ filePath }\`)`);

  return f();
}