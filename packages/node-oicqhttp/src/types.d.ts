import type { Platform } from 'oicq';

// 配置文件类型
export interface Config {
  uin: number;
  password: string;
  platform?: Platform;
  port: number;
}

export interface ConfigImport {
  default: Config;
}