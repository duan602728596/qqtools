import * as process from 'node:process';
import * as path from 'node:path';
import * as fs from 'node:fs';

/* 判断是开发环境还是生产环境 */
export const isDevelopment: boolean = process.env.NODE_ENV === 'development';

/* 获取package.json文件的位置 */
const packageJsonPath: Array<string> = [
  path.join(__dirname, '../package.json'),
  path.join(__dirname, '../../package.json')
];
let packageJsonPathIndex: number = isDevelopment ? 0 : 1;

if (!fs.existsSync(packageJsonPath[packageJsonPathIndex])) {
  packageJsonPathIndex = packageJsonPathIndex === 1 ? 0 : 1;
}

export const packageJson: any = require(packageJsonPath[packageJsonPathIndex]);