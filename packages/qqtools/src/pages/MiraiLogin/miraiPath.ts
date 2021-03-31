/* 获取和设置变量 */
const JAR_DIR: string = 'JAR_DIR';
const JAVA_PATH: string = 'JAVA_PATH';

/* 获取jar文件夹位置 */
export function getJarDir(): string | null {
  const jarDir: string | null = localStorage.getItem(JAR_DIR);

  return jarDir;
}

/* 设置jdk文件位置 */
export function setJarDir(value: string | undefined): void {
  if (value && !/^\s*$/.test(value)) {
    localStorage.setItem(JAR_DIR, value);
  } else {
    localStorage.removeItem(JAR_DIR);
  }
}

/* 获取jdk文件位置 */
export function getJavaPath(): string | null {
  const javaPath: string | null = localStorage.getItem(JAVA_PATH);

  return javaPath;
}

/* 设置jdk文件位置 */
export function setJavaPath(value: string | undefined): void {
  if (value && !/^\s*$/.test(value)) {
    localStorage.setItem(JAVA_PATH, value);
  } else {
    localStorage.removeItem(JAVA_PATH);
  }
}