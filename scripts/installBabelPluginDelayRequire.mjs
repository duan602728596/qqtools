/* global path, fs, cd */
import os from 'node:os';
import { spawn } from 'node:child_process';
import { cwd, npm } from './utils.mjs';

/* 修复window下bash的错误 */
if (os.platform() === 'win32') {
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

const babelPluginDelayRequire = path.join(cwd, 'packages/babel-plugin-delay-require');

function $cmd(cmd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args);

    child.stdout.on('data', (data) => console.log(data.toString()));
    child.stderr.on('data', (data) => console.log(data.toString()));
    child.on('close', () => resolve());
    child.on('error', (err) => reject(err));
  });
}

async function installBabelPluginDelayRequire() {
  // 创建目录
  await fs.ensureDir(babelPluginDelayRequire);
  cd(babelPluginDelayRequire);

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

  await fs.writeFile(path.join(babelPluginDelayRequire, '.git/info/sparse-checkout'), 'packages/babel-plugin-delay-require');

  // 拉取代码
  try {
    await $`git pull origin main --depth=1`;
  } catch {
    await $cmd('git', ['pull', 'origin', 'main', '--depth=1']);
  }

  await fs.copy(
    path.join(babelPluginDelayRequire, 'packages/babel-plugin-delay-require'),
    babelPluginDelayRequire
  );
  await Promise.all([
    fs.remove(path.join(babelPluginDelayRequire, 'packages')),
    fs.remove(path.join(babelPluginDelayRequire, '.git'))
  ]);

  // 编译文件
  try {
    await $`npm run dev`;
  } catch {
    await $cmd(npm, ['run', 'dev']);
  }
}

if (!fs.existsSync(babelPluginDelayRequire)) {
  installBabelPluginDelayRequire();
}