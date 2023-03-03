import util from 'node:util';
import path from 'node:path';
import ncc from '@vercel/ncc';
import { exec } from 'pkg';
import { rimraf } from 'rimraf';
import fse from 'fs-extra/esm';
import zip from 'cross-zip';
import chalk from 'chalk';
import { cwd, command, isWindows, build } from './utils.mjs';
import nodeOicqHttpPackageJson from '../packages/node-oicqhttp/package.json' assert { type: 'json' };

const zipPromise = util.promisify(zip.zip);

async function buildNodeOicqHttp() {
  const npm = isWindows ? 'npm.cmd' : 'npm';
  const nodeOicqHttpPath = path.join(cwd, 'packages/node-oicqhttp');
  const nodeOicqHttpBuild = path.join(build, 'node-oicqhttp');
  const lib = path.join(nodeOicqHttpPath, 'lib/index.js');

  const buildOptions = [
    {
      target: 'node18-linux-x64',
      name: `node-oicqhttp-${ nodeOicqHttpPackageJson.version }-linux64`
    },
    {
      target: 'node18-win-x64',
      name: `node-oicqhttp-${ nodeOicqHttpPackageJson.version }-win`
    },
    {
      target: 'node18-macos-x64',
      name: `node-oicqhttp-${ nodeOicqHttpPackageJson.version }-macos`
    }
  ];

  // 编译
  await rimraf(nodeOicqHttpBuild);
  await command(npm, ['run', 'build'], nodeOicqHttpPath);

  const { code } = await ncc(path.join(nodeOicqHttpPath, '.lib.mid'), {
    minify: false
  });

  await fse.outputFile(lib, code);

  for (const option of buildOptions) {
    console.log(chalk.bgCyan(`build target:${ option.target } name:${ option.name }`));
    const outputPath = path.join(nodeOicqHttpBuild, option.name);

    await exec([
      '--debug',
      '--target',
      option.target,
      '--output',
      path.join(outputPath, 'node-oicqhttp' + (isWindows ? '.exe' : '')),
      lib
    ]);
    await fse.copy(path.join(nodeOicqHttpPath, 'config.js'), path.join(outputPath, 'config.js')); // 复制文件
    await zipPromise(outputPath, `${ outputPath }.zip`);
  }
}

buildNodeOicqHttp();