import type { Platform } from 'oicq';

// 配置文件类型
export interface Config {
  uin: number;
  password: string;
  platform?: Platform;
}