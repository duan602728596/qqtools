/* global path, fs, cd, $ */
import os from 'node:os';
import { spawn } from 'node:child_process';
import { cwd, npm } from './utils.mjs';

const isWindows = os.platform() === 'win32';

/* 修复window下bash的错误 */
if (isWindows) {
  $.quote = function(arg) {
    if (/^[a-z\d/_.-]+$/i.test(arg) || arg === '') {
      return arg;
    }

    return arg.replace(/\\/g, '\\\\')
      .replace(/'/g, '\\\'')
      .replace(/\f/g, '\\f')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t')
      .replace(/\v/g, '\\v')
      .replace(/\0/g, '\\0');
  };
}

/* 执行命令 */
function $cmd(cmd, args) {
  return new Promise((resolve, reject) => {
    const spawnOptions = {};

    if (isWindows) spawnOptions.shell = true;

    const child = spawn(cmd, args, spawnOptions);

    child.stdout.on('data', (data) => console.log(data.toString()));
    child.stderr.on('data', (data) => console.log(data.toString()));
    child.on('close', () => resolve());
    child.on('error', (err) => reject(err));
  });
}

/* 插件目录 */
const babelPluginDelayRequire = path.join(cwd, 'packages/babel-plugin-delay-require'),
  postcssPluginRemoveClassNames = path.join(cwd, 'packages/postcss-plugin-remove-classnames');
const installPluginCache = path.join(cwd, '.installPluginCache');

/* 编译wenjian */
async function buildPlugin(pluginPath) {
  await cd(pluginPath);

  try {
    await $`npm run dev`;
  } catch {
    await $cmd(npm, ['run', 'dev']);
  }
}

/* 安装插件 */
async function installPlugins() {
  // 创建目录
  await fs.ensureDir(installPluginCache);
  cd(installPluginCache);

  // 初始化项目
  try {
    await $`git init`;
    await $`git remote add -f origin https://github.com/duan602728596/48tools.git`;
    await $`git config core.sparsecheckout true`;
  } catch {
    await $cmd('git', ['init']);
    await $cmd('git', ['remote', 'add', '-f', 'origin', 'https://github.com/duan602728596/48tools.git']);
    await $cmd('git', ['config', 'core.sparsecheckout', 'true']);
  }

  await fs.writeFile(path.join(installPluginCache, '.git/info/sparse-checkout'), `packages/babel-plugin-delay-require
postcss-plugin-remove-classnames`);

  // 拉取代码
  try {
    await $`git pull origin main --depth=1`;
  } catch {
    await $cmd('git', ['pull', 'origin', 'main', '--depth=1']);
  }

  // 复制文件
  await Promise.all([
    fs.copy(path.join(installPluginCache, 'packages/babel-plugin-delay-require'), babelPluginDelayRequire),
    fs.copy(path.join(installPluginCache, 'packages/postcss-plugin-remove-classnames'), postcssPluginRemoveClassNames)
  ]);

  // 编译文件
  await buildPlugin(babelPluginDelayRequire);
  await buildPlugin(postcssPluginRemoveClassNames);

  await fs.remove(installPluginCache);
}

installPlugins();