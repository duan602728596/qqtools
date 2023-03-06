import util from 'node:util';
import path from 'node:path';
import ncc from '@vercel/ncc';
import { rimraf } from 'rimraf';
import fse from 'fs-extra/esm';
import zip from 'cross-zip';
import { cwd, build } from './utils.mjs';
import nodeOicqHttpPackageJson from '../packages/node-oicqhttp/package.json' assert { type: 'json' };

const zipPromise = util.promisify(zip.zip);

async function buildNodeOicqHttp() {
  const nodeOicqHttpPath = path.join(cwd, 'packages/node-oicqhttp');
  const nodeOicqHttpBuild = path.join(build, 'node-oicqhttp');
  const src = path.join(nodeOicqHttpPath, 'src/index.ts');

  // 编译
  await rimraf(nodeOicqHttpBuild);
  const { code } = await ncc(src, {
    minify: true,
    externals: ['config.mjs', 'config.dev.mjs'],
    target: 'es2022'
  });

  await fse.outputFile(
    path.join(nodeOicqHttpBuild, 'node-oicqhttp.mjs'),
    `import { createRequire } from 'node:module';const require = createRequire(import.meta.url);${ code }`);
  await Promise.all([
    fse.copy(path.join(nodeOicqHttpPath, 'config.mjs'), path.join(nodeOicqHttpBuild, 'config.mjs')),
    fse.writeJson(path.join(nodeOicqHttpBuild, 'package.json'), {
      name: 'node-oicqhttp',
      version: nodeOicqHttpPackageJson.version,
      type: 'module',
      scripts: {
        server: 'node node-oicqhttp.mjs'
      }
    }, { spaces: 2 })
  ]);
  await zipPromise(nodeOicqHttpBuild, `${ nodeOicqHttpBuild }-${ nodeOicqHttpPackageJson.version }.zip`);
}

buildNodeOicqHttp();