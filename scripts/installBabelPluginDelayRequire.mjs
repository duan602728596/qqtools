/* global path, fs, cd */
import { cwd } from './utils.mjs';

const babelPluginDelayRequire = path.join(cwd, 'packages/babel-plugin-delay-require');

async function installBabelPluginDelayRequire() {
  await fs.ensureDir(babelPluginDelayRequire);
  cd(babelPluginDelayRequire);
  await $`git init`;
  await $`git remote add -f origin https://github.com/duan602728596/48tools.git`;
  await $`git config core.sparsecheckout true`;
  await fs.writeFile(
    path.join(babelPluginDelayRequire, '.git/info/sparse-checkout'),
    'packages/babel-plugin-delay-require'
  );
  await $`git pull origin main --depth=1`;
  await fs.copy(
    path.join(babelPluginDelayRequire, 'packages/babel-plugin-delay-require'),
    babelPluginDelayRequire
  );
  await Promise.all([
    fs.remove(path.join(babelPluginDelayRequire, 'packages')),
    fs.remove(path.join(babelPluginDelayRequire, '.git'))
  ]);
}

if (!fs.existsSync(babelPluginDelayRequire)) {
  installBabelPluginDelayRequire();
}