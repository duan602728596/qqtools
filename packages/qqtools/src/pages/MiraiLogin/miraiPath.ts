/* @deprecated */
/* 获取和设置变量 */
const JAR_DIR: string = 'JAR_DIR';
const JAVA_PATH: string = 'JAVA_PATH';

/* 删除旧的数据配置 */
localStorage.getItem(JAR_DIR) && localStorage.removeItem(JAR_DIR);
localStorage.getItem(JAVA_PATH) && localStorage.removeItem(JAVA_PATH);

/* 设置mcl文件夹的位置 */
const MCL_DIR: string = 'MCL_DIR';

/* 获取mcl文件夹位置 */
export function getMclDir(): string | null {
  const mclDir: string | null = localStorage.getItem(MCL_DIR);

  return mclDir;
}

/* 设置mcl文件位置 */
export function setMclDir(value: string | null | undefined): void {
  if (value && !/^\s*$/.test(value)) {
    localStorage.setItem(MCL_DIR, value);
  } else {
    localStorage.removeItem(MCL_DIR);
  }
}