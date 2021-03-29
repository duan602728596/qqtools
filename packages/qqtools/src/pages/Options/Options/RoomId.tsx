import { promises as fsP } from 'fs';
import { shell, OpenDialogReturnValue } from 'electron';
import { dialog } from '@electron/remote';
import { Fragment, useState, ReactElement, Dispatch as D, SetStateAction as S, MouseEvent } from 'react';
import type { Dispatch } from 'redux';
import { useDispatch } from 'react-redux';
import { Button, Modal, Space, Alert, message } from 'antd';
import style from './roomId.sass';
import { saveRoomId, deleteRoomId } from '../reducers/reducers';
import type { MemberInfo } from '../../../types';

/* 房间信息导入 */
function RoomId(props: {}): ReactElement {
  const dispatch: Dispatch = useDispatch();
  const [visible, setVisible]: [boolean, D<S<boolean>>] = useState(false);

  // 下载列表文件
  function handleDownloadRoomIdJsonClick(event: MouseEvent<HTMLAnchorElement>): void {
    shell.openExternal('https://raw.githubusercontent.com/duan602728596/qqtools/main/packages/NIMTest/node/roomId.json');
  }

  // 导入文件
  async function handleImportRoomIdJsonClick(event: MouseEvent<HTMLButtonElement>): Promise<void> {
    const result: OpenDialogReturnValue = await dialog.showOpenDialog({
      properties: ['openFile']
    });

    if (result.canceled || !result.filePaths || result.filePaths.length === 0) return;

    try {
      const roomId: string = await fsP.readFile(result.filePaths[0], { encoding: 'utf8' });
      const roomIdJson: { roomId: Array<MemberInfo> } = JSON.parse(roomId);

      dispatch(saveRoomId({
        data: {
          name: 'roomId',
          value: roomIdJson.roomId
        }
      }));
      message.success('房间信息导入成功！');
      setVisible(false);
    } catch (err) {
      console.error(err);
      message.error('房间信息导入失败！');
    }
  }

  // 删除文件
  function handleDeleteRoomIdJsonClick(event: MouseEvent<HTMLButtonElement>): void {
    dispatch(deleteRoomId({
      query: 'roomId'
    }));
    message.success('已删除房间信息，你可以重新导入。');
  }

  return (
    <Fragment>
      <Button onClick={ (event: MouseEvent<HTMLButtonElement>): void => setVisible(true) }>导入房间信息</Button>
      <Modal visible={ visible }
        width={ 500 }
        centered={ true }
        onCancel={ (event: MouseEvent<HTMLButtonElement>): void => setVisible(false) }
      >
        <div className={ style.box }>
          <Space className={ style.marginBottom }>
            <Button onClick={ handleImportRoomIdJsonClick }>导入房间信息</Button>
            <Button type="primary" danger={ true } onClick={ handleDeleteRoomIdJsonClick }>清除房间信息</Button>
          </Space>
          <Alert type="info" message={ [
            '如果想要监听房间出入信息，必须先导入房间的信息列表。',
            <a key="download" role="button" aria-label="点击下载" onClick={ handleDownloadRoomIdJsonClick }>点击下载</a>,
            '列表文件。'
          ] } />
        </div>
      </Modal>
    </Fragment>
  );
}

export default RoomId;