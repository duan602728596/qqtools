import chalk from 'chalk';

/**
 * 输出一些日志
 */

export function error(log: any): void {
  console.error(chalk.red(log));
}

export function warning(log: any): void {
  console.warn(chalk.yellow(log));
}