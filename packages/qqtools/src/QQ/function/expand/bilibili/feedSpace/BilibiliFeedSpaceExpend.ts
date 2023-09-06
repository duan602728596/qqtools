import { QQModals } from '../../../../QQBotModals/ModalTypes';
import getBilibiliFeedSpaceWorker from './bilibiliFeedSpace.worker/getBilibiliFeedSpaceWorker';
import type { OptionsItemBilibiliFeedSpace } from '../../../../../commonTypes';
import type { MessageListener } from '../../../../QQBotModals/Basic';

/* bilibili空间动态 */
class BilibiliFeedSpaceExpend {
  public config: OptionsItemBilibiliFeedSpace;
  public qq: QQModals;
  public bilibiliFeedSpaceWorker?: Worker;
  public bilibiliFeedSpaceId: string;

  constructor({ config, qq }: { config: OptionsItemBilibiliFeedSpace; qq: QQModals }) {
    this.config = config;
    this.qq = qq;
  }

  handleBilibiliFeedSpaceWorkerMessage: MessageListener = async (event: MessageEvent): Promise<void> => {
    for (let i: number = event.data.sendGroup.length - 1; i >= 0; i--) {
      await this.qq.sendMessage(event.data.sendGroup[i]);
    }
  };

  // 初始化
  initBilibiliFeedSpaceWorker(): void {
    const { bilibiliFeedSpaceListener, bilibiliFeedSpaceId, cookieString }: OptionsItemBilibiliFeedSpace = this.config;

    if (bilibiliFeedSpaceListener && bilibiliFeedSpaceId) {
      this.bilibiliFeedSpaceId = bilibiliFeedSpaceId;
      this.bilibiliFeedSpaceWorker = getBilibiliFeedSpaceWorker();
      this.bilibiliFeedSpaceWorker.addEventListener('message', this.handleBilibiliFeedSpaceWorkerMessage);
      this.bilibiliFeedSpaceWorker.postMessage({
        bilibiliFeedSpaceId,
        protocol: this.qq.protocol,
        cookie: cookieString
      });
    }
  }

  // 销毁
  destroy(): void {
    // 销毁bilibili监听
    if (this.bilibiliFeedSpaceWorker) {
      this.bilibiliFeedSpaceWorker.terminate();
      this.bilibiliFeedSpaceWorker = undefined;
    }
  }
}

export default BilibiliFeedSpaceExpend;