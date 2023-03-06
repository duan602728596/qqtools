import * as process from 'node:process';

// 是否为开发环境
export const isDevelopment: boolean = process.env.NODE_ENV === 'development';

// import
export function dynamicImport<T>(filePath: string): Promise<T> {
  // eslint-disable-next-line no-new-func
  const f: Function = new Function(`return import(\`${ filePath }\`)`);

  return f();
}