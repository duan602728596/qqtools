import * as path from 'node:path';

const asarDir: string = path.join(__dirname, '../../../app.asar');
const asarDirNodeModules: string = path.join(asarDir, 'node_modules');

/**
 * 在worker中加载模块
 * @param { string } moduleName: 模块名称
 * @param { boolean } isDevelopment: 是否为开发环境
 */
function workerRequire<T>(moduleName: string, isDevelopment?: boolean): T {
  return require(isDevelopment ? moduleName : path.join(asarDirNodeModules, `${ moduleName }/index.js`));
}

export default workerRequire;