import type { LoginErrorCode } from 'oicq';
import type { Config } from '../types.js';

export interface OicqArgs {
  config: Config;
  onlineSuccessCallback();
}

// system.login.slider
export interface SystemLoginSliderEvent {
  url: string;
}

export type SystemLoginSliderListener = (event: SystemLoginSliderEvent) => void | Promise<void>;

// system.login.device
export interface SystemLoginDeviceEvent {
  url: string;
  phone: string;
}

export type SystemLoginDeviceListener = (event: SystemLoginDeviceEvent) => void | Promise<void>;

// system.login.error
export interface SystemLoginErrorEvent {
  code: LoginErrorCode | number;
  message: string;
}

export type SystemLoginErrorListener = (event: SystemLoginErrorEvent) => void | Promise<void>;

// system.offline
export interface SystemOfflineEvent {
  message: string;
}

export type SystemOfflineListener = (event: SystemOfflineEvent) => void | Promise<void>;

// system.online
export type SystemOnlineListener = () => void | Promise<void>;