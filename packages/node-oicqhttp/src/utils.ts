import * as process from 'node:process';
import { fileURLToPath } from 'node:url';
import * as path from 'node:path';

// 是否为开发环境
export const isDevelopment: boolean = process.env.NODE_ENV === 'development';

// 导出文件路径
export const __filename: string = fileURLToPath(import.meta.url);
export const __dirname: string = path.dirname(__filename);