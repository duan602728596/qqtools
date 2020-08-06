const util = require('util');
const path = require('path');
const rimraf = require('rimraf');
const fse = require('fs-extra');
const builder = require('electron-builder');

const rimrafPromise = util.promisify(rimraf);

const cwd = path.join(__dirname, '../');
const appDir = path.join(cwd, 'app');
const staticsDir = path.join(cwd, 'statics');
const build = path.join(cwd, 'build');

/* 打包脚本 */
async function unpack() {
  // 删除
  await Promise.all([
    rimrafPromise(appDir),
    rimrafPromise(build)
  ]);

  // 拷贝文件
  await fse.copy(path.join(cwd, 'packages/app'), appDir);
  await Promise.all([
    fse.copy(path.join(cwd, 'packages/main/lib'), path.join(appDir, 'bin/lib')),
    fse.copy(path.join(cwd, 'packages/qqtools/dist'), path.join(appDir, 'dist'))
  ]);

  const Platform = builder.Platform;

  // 配置
  const config = {
    appId: 'qqtools',
    productName: 'qqtools',
    copyright: '段昊辰',
    mac: {
      target: 'dir',
      icon: path.join(staticsDir, 'titleBarIcon.icns')
    },
    win: {
      target: 'dir',
      icon: path.join(staticsDir, 'titleBarIcon.ico')
    }
  };

  // 编译
  /*
  await builder.build({
    targets: Platform.MAC.createTarget(),
    config: {
      ...config,
      directories: {
        app: appDir,
        output: path.join(build, 'mac')
      }
    }
  });
  */

  await builder.build({
    targets: Platform.WINDOWS.createTarget(),
    config: {
      ...config,
      directories: {
        app: appDir,
        output: path.join(build, 'win')
      }
    }
  });
}

unpack();