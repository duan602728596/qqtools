import { message } from 'antd';
import getDouyinWorker from '../utils/douyin.worker/getDouyinWorker';
import { omit } from '../../utils/lodash';
import type { OptionsItemDouyin } from '../../commonTypes';
import type QQ from '../QQ';
import type OicqQQ from '../OicqQQ';
import type { MessageChain, UserScriptRendedData } from '../qq.types';

interface LogItem {
  data: UserScriptRendedData | undefined;
  time: string;
  init?: 1;
  change?: 1;
}

globalThis.$l = {};

/* 记录抖音获取的数据，便于debug */
class DouyinLog {
  static logIndex: number = 0;

  description: string;
  userId: string;
  maxlength: number;
  readonly log: Array<LogItem>;
  lastChange: string | undefined;
  readonly index: number;

  constructor({ description, userId, maxlength }: { description: string; userId: string; maxlength?: number }) {
    this.description = description;
    this.userId = userId;
    this.maxlength = maxlength ?? 100;
    this.log = [];
    this.index = DouyinLog.logIndex++;

    const $self: this = this;

    globalThis.$l[`$${ this.index }`] = {
      $d: this.description ?? this.userId,
      $g: this.log,
      get $t(): string | undefined {
        return $self.lastChange;
      }
    };
  }

  addLog(item: LogItem): void {
    this.log.unshift(item);

    if (item.change) {
      this.lastChange = item.time;
    }

    if (this.log.length > 100) {
      this.log.pop();
    }
  }

  destroy(): void {
    delete globalThis.$l[`$${ this.index }`];
  }
}

interface DouyinMessageData {
  type: 'message';
  sendGroup: Array<MessageChain[] | string>;
}

interface DouyinLogData {
  type: 'log';
  data: UserScriptRendedData | undefined;
  time: string;
}

type MessageListener = (event: MessageEvent<DouyinMessageData | DouyinLogData>) => void | Promise<void>;

/* 抖音监听 */
class DouyinExpand {
  public config: OptionsItemDouyin;
  public qq: QQ | OicqQQ;
  public protocol: 'mirai' | 'oicq';
  public douyinWorker?: Worker;
  public douyinLog: DouyinLog;

  constructor({ config, qq, protocol }: {
    config: OptionsItemDouyin;
    qq: QQ | OicqQQ;
    protocol: 'mirai' | 'oicq';
  }) {
    this.config = config;
    this.qq = qq;
    this.protocol = protocol;
  }

  // 微博监听
  handleDouyinMessage: MessageListener = async (event: MessageEvent<DouyinMessageData | DouyinLogData>): Promise<void> => {
    if (event.data.type === 'message') {
      for (let i: number = event.data.sendGroup.length - 1; i >= 0; i--) {
        await this.qq.sendMessage(event.data.sendGroup[i] as any);
      }
    } else {
      this.douyinLog.addLog(omit(event.data, ['type']));
    }
  };

  // 抖音监听初始化
  initDouyinWorker(): void {
    const { douyinListener, userId }: OptionsItemDouyin = this.config;

    if (!(douyinListener && userId && !/^\s*$/.test(userId))) return;

    const executablePath: string | null = localStorage.getItem('PUPPETEER_EXECUTABLE_PATH');

    if (!(executablePath && !/^\s*$/.test(executablePath))) {
      message.warning('请先配置无头浏览器！');
      console.warn('请先配置无头浏览器！');

      return;
    }

    this.douyinWorker = getDouyinWorker();
    this.douyinWorker.addEventListener('message', this.handleDouyinMessage);
    this.douyinWorker.postMessage({
      userId: this.config.userId,
      description: this.config.description,
      protocol: this.protocol,
      executablePath
    });
    this.douyinLog = new DouyinLog({
      description: this.config.description,
      userId: this.config.userId
    });
  }

  // 销毁
  destroy(): void {
    if (this.douyinWorker) {
      this.douyinWorker.postMessage({ close: true });
      this.douyinWorker.terminate();
      this.douyinWorker = undefined;
      this.douyinLog?.destroy?.();
    }
  }
}

export default DouyinExpand;