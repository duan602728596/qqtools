import path from 'node:path';
import process from 'node:process';
import { spawn } from 'node:child_process';
import { metaHelper } from '@sweet-milktea/utils';

export const { __dirname } = metaHelper(import.meta.url);

// 定义文件位置
export const cwd = path.join(__dirname, '../');      // 网站目录
export const appDir = path.join(cwd, 'app');         // build用的目录
export const wwwDir = path.join(cwd, 'www');         // 中间代码
export const staticsDir = path.join(cwd, 'statics'); // 静态资源目录
export const build = path.join(cwd, 'build');        // 最终生成的可执行文件

// SDK
const sdkDownloadBasicDir = path.join(build, 'node-nim-sdk');

export const sdkDownloadDir = {
  linux: path.join(sdkDownloadBasicDir, 'linux'),
  mac: path.join(sdkDownloadBasicDir, 'mac'),
  macArm64: path.join(sdkDownloadBasicDir, 'mac-arm64'),
  win64: path.join(sdkDownloadBasicDir, 'win64'),
  win32: path.join(sdkDownloadBasicDir, 'win32')
};

// 打包后的文件位置
export const output = {
  mac: path.join(build, 'mac'),            // mac
  macArm64: path.join(build, 'mac-arm64'), // mac-arm64
  win: path.join(build, 'win'),            // win64
  win32: path.join(build, 'win32'),        // win32
  winArm64: path.join(build, 'win-arm64'), // win-arm64
  linux: path.join(build, 'linux')         // linux
};

export const unpacked = {
  mac: path.join(output.mac, 'mac'),
  macArm64: path.join(output.macArm64, 'mac-arm64'),
  win: path.join(output.win, 'win-unpacked'),
  win32: path.join(output.win32, 'win-ia32-unpacked'),
  winArm64: path.join(output.winArm64, 'win-arm64-unpacked'),
  linux: path.join(output.linux, 'linux-unpacked')
};

export const unpackedNodeModules = {
  mac: path.join(unpacked.mac, 'qqtools.app/Contents/Resources/app/node_modules'),
  macArm64: path.join(unpacked.macArm64, 'qqtools.app/Contents/Resources/app/node_modules'),
  win: path.join(unpacked.win, 'resources/app/node_modules'),
  win32: path.join(unpacked.win32, 'resources/app/node_modules'),
  winArm64: path.join(unpacked.winArm64, 'resources/app/node_modules'),
  linux: path.join(unpacked.linux, 'resources/app/node_modules')
};

// 系统环境
export const isMacOS = process.platform === 'darwin';
export const isWindows = process.platform === 'win32';
export const isArm64 = process.arch === 'arm64';

/**
 * 执行命令
 * @param { string } cmd - 命令
 * @param { Array<string> } args - 参数
 * @param { string } cwdPath - 文件夹
 */
export function command(cmd, args, cwdPath) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      stdio: 'inherit',
      cwd: cwdPath
    });

    child.on('close', function(code) {
      resolve();
    });

    child.on('error', function(error) {
      reject(error);
    });
  });
}