import { requestRoomInfo } from '../services/services';
import getBilibiliWorker from '../utils/bilibili.worker/getBilibiliWorker';
import parser, { type ParserResult } from '../parser/index';
import type { QQModals } from '../QQBotModals/ModalTypes';
import type { OptionsItemBilibili } from '../../commonTypes';
import type { BilibiliRoomInfo } from '../qq.types';

type MessageListener = (event: MessageEvent) => void | Promise<void>;

/* bilibili */
class BilibiliExpand {
  public config: OptionsItemBilibili;
  public qq: QQModals;
  public bilibiliWorker?: Worker;  // b站直播监听
  public bilibiliUsername: string; // 用户名

  constructor({ config, qq }: { config: OptionsItemBilibili; qq: QQModals }) {
    this.config = config;
    this.qq = qq;
  }

  // bilibili message监听事件
  handleBilibiliWorkerMessage: MessageListener = async (event: MessageEvent): Promise<void> => {
    const { bilibiliAtAll }: OptionsItemBilibili = this.config;
    const text: string = `bilibili：${ this.bilibiliUsername }在B站开启了直播。`;
    const sendMessage: ParserResult = parser(`${ bilibiliAtAll ? '[CQ:at,qq=all]' : '' }${ text }`, this.qq.protocol);

    await this.qq.sendMessage(sendMessage as any);
  };

  // bilibili直播监听初始化
  async initBilibiliWorker(): Promise<void> {
    const { bilibiliLive, bilibiliLiveId }: OptionsItemBilibili = this.config;

    if (bilibiliLive && bilibiliLiveId) {
      const res: BilibiliRoomInfo = await requestRoomInfo(bilibiliLiveId);

      this.bilibiliUsername = res.data.anchor_info.base_info.uname;
      this.bilibiliWorker = getBilibiliWorker();
      this.bilibiliWorker.addEventListener('message', this.handleBilibiliWorkerMessage, false);
      this.bilibiliWorker.postMessage({ id: bilibiliLiveId });
    }
  }

  // 销毁
  destroy(): void {
    // 销毁bilibili监听
    if (this.bilibiliWorker) {
      this.bilibiliWorker.terminate();
      this.bilibiliWorker = undefined;
    }
  }
}

export default BilibiliExpand;