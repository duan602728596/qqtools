import {
  ipcMain,
  dialog,
  type IpcMainInvokeEvent,
  type OpenDialogOptions,
  type OpenDialogReturnValue,
  type SaveDialogOptions,
  type SaveDialogReturnValue
} from 'electron';
import { IpcRemoteHandleChannel } from '../channelEnum';

/* Remote方法的迁移 */
function ipcRemoteHandle(): void {
  // 显示打开的文件选择框
  ipcMain.handle(
    IpcRemoteHandleChannel.ShowOpenDialog,
    function(event: IpcMainInvokeEvent, options: OpenDialogOptions): Promise<OpenDialogReturnValue> {
      return dialog.showOpenDialog(options);
    });

  // 显示保存的文件选择框
  ipcMain.handle(
    IpcRemoteHandleChannel.ShowSaveDialog,
    function(event: IpcMainInvokeEvent, options: SaveDialogOptions): Promise<SaveDialogReturnValue> {
      return dialog.showSaveDialog(options);
    });
}

export default ipcRemoteHandle;