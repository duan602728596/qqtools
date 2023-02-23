import util from 'node:util';
import path from 'node:path';
import { exec } from 'pkg';
import { rimraf } from 'rimraf';
import fse from 'fs-extra/esm';
import zip from 'cross-zip';
import chalk from 'chalk';
import { cwd, command, isWindows, isMacOS, build } from './utils.mjs';

const zipPromise = util.promisify(zip.zip);

async function buildNodeOicqHttp() {
  const npm = isWindows ? 'npm.cmd' : 'npm';
  const nodeOicqHttpPath = path.join(cwd, 'packages/node-oicqhttp');
  const nodeOicqHttpBuild = path.join(build, 'node-oicqhttp');
  const buildOptions = [
    {
      target: 'node18-linux-x64',
      name: 'node-oicqhttp-linux64'
    },
    {
      target: 'node18-win-x64',
      name: 'node-oicqhttp-win'
    },
    {
      target: 'node18-macos-x64',
      name: 'node-oicqhttp-macos'
    },
    isMacOS && {
      target: 'node18-macos-arm64',
      name: 'node-oicqhttp-macos-arm64'
    }
  ].filter(Boolean);

  // 编译
  await rimraf(nodeOicqHttpBuild);
  await command(npm, ['run', 'build'], nodeOicqHttpPath);

  for (const option of buildOptions) {
    console.log(chalk.bgCyan(`build target:${ option.target } name:${ option.name }`));
    const outputPath = path.join(nodeOicqHttpBuild, option.name);

    await exec([
      '--target',
      option.target,
      '--output',
      path.join(outputPath, 'node-oicqhttp' + (isWindows ? '.exe' : '')),
      path.join(nodeOicqHttpPath, 'lib/index.js')
    ]);
    await fse.copy(path.join(nodeOicqHttpPath, 'config.js'), path.join(outputPath, 'config.js')); // 复制文件
    await zipPromise(outputPath, `${ outputPath }.zip`);
  }
}

buildNodeOicqHttp();