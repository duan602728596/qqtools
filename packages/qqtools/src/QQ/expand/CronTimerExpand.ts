import { scheduleJob, type Job } from 'node-schedule';
import parser from '../parser/index';
import type { QQModals } from '../QQBotModals/ModalTypes';
import type { OptionsItemCronTimer } from '../../commonTypes';

/* 定时任务 */
class CronTimerExpand {
  public config: OptionsItemCronTimer;
  public qq: QQModals;
  public cronJob?: Job; // 定时任务

  constructor({ config, qq }: { config: OptionsItemCronTimer; qq: QQModals }) {
    this.config = config;
    this.qq = qq;
  }

  // 定时任务初始化
  initCronJob(): void {
    const { cronJob, cronTime, cronSendData }: OptionsItemCronTimer = this.config;

    if (cronJob && cronTime && cronSendData) {
      this.cronJob = scheduleJob(cronTime, (): void => {
        this.qq.sendMessage(parser(cronSendData, this.qq.protocol) as any);
      });
    }
  }

  // 销毁
  destroy(): void {
    // 销毁定时任务
    if (this.cronJob) {
      this.cronJob.cancel();
      this.cronJob = undefined;
    }
  }
}

export default CronTimerExpand;