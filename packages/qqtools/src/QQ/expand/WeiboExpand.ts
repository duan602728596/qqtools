import { message } from 'antd';
import { requestWeiboInfo } from '../services/services';
import getWeiboWorker from '../utils/weibo.worker/getWeiboWorker';
import getWeiboSuperTopicWorker from '../utils/weiboSuperTopic.worker/getWeiboSuperTopicWorker';
import type QQ from '../QQ';
import type OicqQQ from '../OicqQQ';
import type { OptionsItemWeibo } from '../../types';
import type { WeiboTab, WeiboInfo } from '../qq.types';

type MessageListener = (event: MessageEvent) => void | Promise<void>;

/* 微博 */
class WeiboExpand {
  public config: OptionsItemWeibo;
  public qq: QQ | OicqQQ;
  public protocol: 'mirai' | 'oicq';
  public weiboLfid: string;    // 微博的lfid
  public weiboWorker?: Worker; // 微博监听
  public weiboSuperTopicLfid: string;    // 微博的超级话题lfid
  public weiboSuperTopicWorker?: Worker; // 微博超级话题监听

  constructor({ config, qq, protocol }: {
    config: OptionsItemWeibo;
    qq: QQ | OicqQQ;
    protocol: 'mirai' | 'oicq';
  }) {
    this.config = config;
    this.qq = qq;
    this.protocol = protocol;
  }

  // 微博监听
  handleWeiboWorkerMessage: MessageListener = async (event: MessageEvent): Promise<void> => {
    await this.qq.sendMessage(event.data.sendGroup);
  };

  // 微博初始化
  async initWeiboWorker(): Promise<void> {
    const { weiboListener, weiboUid, weiboAtAll }: OptionsItemWeibo = this.config;

    if (!(weiboListener && weiboUid)) return;

    const resWeiboInfo: WeiboInfo = await requestWeiboInfo(weiboUid);
    const weiboTab: Array<WeiboTab> = resWeiboInfo?.data?.tabsInfo?.tabs
      .filter((o: WeiboTab): boolean => o.tabKey === 'weibo');

    if (weiboTab.length > 0) {
      this.weiboLfid = weiboTab[0].containerid;
      this.weiboWorker = getWeiboWorker();
      this.weiboWorker.addEventListener('message', this.handleWeiboWorkerMessage, false);
      this.weiboWorker.postMessage({
        lfid: this.weiboLfid,
        weiboAtAll,
        protocol: this.protocol
      });
    } else {
      message.warn('没有获取到微博用户的相关信息！请稍后重新登录。');
    }
  }

  // 微博超级话题初始化
  initWeiboSuperTopicWorker(): void {
    const { weiboSuperTopicListener, weiboSuperTopicLfid }: OptionsItemWeibo = this.config;

    if (!(weiboSuperTopicListener && weiboSuperTopicLfid)) return;

    this.weiboSuperTopicLfid = weiboSuperTopicLfid;
    this.weiboSuperTopicWorker = getWeiboSuperTopicWorker();
    this.weiboSuperTopicWorker.addEventListener('message', this.handleWeiboWorkerMessage, false);
    this.weiboSuperTopicWorker.postMessage({
      lfid: this.weiboSuperTopicLfid,
      protocol: this.protocol
    });
  }

  // 销毁
  destroy(): void {
    // 销毁微博监听
    if (this.weiboWorker) {
      this.weiboWorker.terminate();
      this.weiboWorker = undefined;
    }

    // 销毁微博超级话题监听
    if (this.weiboSuperTopicWorker) {
      this.weiboSuperTopicWorker.terminate();
      this.weiboSuperTopicWorker = undefined;
    }
  }
}

export default WeiboExpand;