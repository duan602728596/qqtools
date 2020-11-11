import { decodeData } from './taobaUtils.mjs';

/* 对字符串解码测试 */
async function main() {
  // 输入
  const string = '';
  const result = await decodeData(string);

  console.log(result);
}

main();