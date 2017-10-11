// @flow
/* 配置文件 */
const path = node_require('path');
const process = node_require('process');
const execPath = path.dirname(process.execPath).replace(/\\/g, '/');

const option: {
  cache: string
} = {
  cache: `${ execPath }/.cache`,        // 文件缓存目录
  ptqr: `${ execPath }/.cache/ptqr.png` // 二维码
};

export default option;