import { CronJob } from 'cron';
import { miraiTemplate } from '../utils/miraiUtils';
import { isOicq } from './utils';
import type QQ from '../QQ';
import type OicqQQ from '../OicqQQ';
import type { OptionsItemCronTimer } from '../../types';

/* 定时任务 */
class CronTimerExpand {
  public config: OptionsItemCronTimer;
  public qq: QQ | OicqQQ;
  public cronJob?: CronJob; // 定时任务

  constructor({ config, qq }: { config: OptionsItemCronTimer; qq: QQ | OicqQQ }) {
    this.config = config;
    this.qq = qq;
  }

  // 定时任务初始化
  initCronJob(): void {
    const { cronJob, cronTime, cronSendData }: OptionsItemCronTimer = this.config;

    if (cronJob && cronTime && cronSendData) {
      this.cronJob = new CronJob(cronTime, (): void => {
        if (isOicq(this.qq)) {
          this.qq.sendMessage(cronSendData);
        } else {
          this.qq.sendMessage(miraiTemplate(cronSendData));
        }
      });

      this.cronJob.start();
    }
  }

  // 销毁
  destroy(): void {
    // 销毁定时任务
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = undefined;
    }
  }
}

export default CronTimerExpand;