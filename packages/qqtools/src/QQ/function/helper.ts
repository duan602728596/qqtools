import * as process from 'node:process';

export const isWindowsArm: boolean = process.platform === 'win32' && process.arch === 'arm64';