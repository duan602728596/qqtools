import {
  ipcMain,
  dialog,
  type BrowserWindow,
  type IpcMainInvokeEvent,
  type OpenDialogOptions,
  type OpenDialogReturnValue,
  type SaveDialogOptions,
  type SaveDialogReturnValue
} from 'electron';

/* Remote方法的迁移 */
function ipcRemoteHandle(win: BrowserWindow): void {
  // 显示打开的文件选择框
  ipcMain.handle(
    'show-open-dialog',
    function(event: IpcMainInvokeEvent, options: OpenDialogOptions): Promise<OpenDialogReturnValue> {
      return dialog.showOpenDialog(options);
    });

  // 显示保存的文件选择框
  ipcMain.handle(
    'show-save-dialog',
    function(event: IpcMainInvokeEvent, options: SaveDialogOptions): Promise<SaveDialogReturnValue> {
      return dialog.showSaveDialog(options);
    });
}

export default ipcRemoteHandle;