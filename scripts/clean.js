const util = require('util');
const glob = require('glob');
const path = require('path');
const fse = require('fs-extra');

const globPromise = util.promisify(glob);

const cwd = path.join(__dirname, '../');
const build = path.join(cwd, 'build');

async function clean() {
  // 删除mac
  /*
  const macFiles = await globPromise(path.join(build, 'mac/mac/qqtools.app/Contents/Resources/*.lproj'));
  const macDeleteTasks = [];

  macFiles.forEach((o) => !/zh_CN/i.test(o) && macDeleteTasks.push(fse.remove(o)));

  await Promise.all(macDeleteTasks);
  */

  // 删除win
  const winFiles = await globPromise(path.join(build, 'win/win-unpacked/locales/*.pak'));
  const winDeleteTasks = [];

  winFiles.forEach((o) => !/zh-CN/i.test(o) && winDeleteTasks.push(fse.remove(o)));

  await Promise.all(winDeleteTasks);
}

clean();