import * as path from 'node:path';
import * as process from 'node:process';
import 'asar-node';

/* 判断是开发环境还是生产环境 */
const isDevelopment: boolean = process.env.NODE_ENV === 'development';
const asarDir: string = path.join(__dirname, '../../../app.asar');
const asarDirNodeModules: string = path.join(asarDir, 'node_modules');

/**
 * 在worker中加载模块
 * @param { string } moduleName: 模块名称
 */
function asarNodeRequire<T>(moduleName: string): T {
  return require(isDevelopment ? moduleName : path.join(asarDirNodeModules, `${ moduleName }/index.js`));
}

export default asarNodeRequire;