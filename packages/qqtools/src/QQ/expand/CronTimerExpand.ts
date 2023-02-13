import { scheduleJob, type Job } from 'node-schedule';
import { miraiTemplate } from '../utils/miraiUtils';
import { isOicqOrGoCQHttp } from './utils';
import type MiraiQQ from '../QQBotModals/MiraiQQ';
import type OicqQQ from '../QQBotModals/OicqQQ';
import type { OptionsItemCronTimer } from '../../commonTypes';

/* 定时任务 */
class CronTimerExpand {
  public config: OptionsItemCronTimer;
  public qq: MiraiQQ | OicqQQ;
  public cronJob?: Job; // 定时任务

  constructor({ config, qq }: { config: OptionsItemCronTimer; qq: MiraiQQ | OicqQQ }) {
    this.config = config;
    this.qq = qq;
  }

  // 定时任务初始化
  initCronJob(): void {
    const { cronJob, cronTime, cronSendData }: OptionsItemCronTimer = this.config;

    if (cronJob && cronTime && cronSendData) {
      this.cronJob = scheduleJob(cronTime, (): void => {
        if (isOicqOrGoCQHttp(this.qq)) {
          this.qq.sendMessage(cronSendData);
        } else {
          this.qq.sendMessage(miraiTemplate(cronSendData));
        }
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