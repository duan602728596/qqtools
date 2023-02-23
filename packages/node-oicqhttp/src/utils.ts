import * as process from 'node:process';

// 是否为开发环境
export const isDevelopment: boolean = process.env.NODE_ENV === 'development';