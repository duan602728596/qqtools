import { promises as fsP } from 'node:fs';
import { shell, type OpenDialogReturnValue } from 'electron';
import { Fragment, useState, type ReactElement, type Dispatch as D, type SetStateAction as S, type MouseEvent } from 'react';
import { useDispatch } from 'react-redux';
import type { Dispatch } from '@reduxjs/toolkit';
import { Button, Modal, Space, Alert, message } from 'antd';
import type { UseMessageReturnType } from '@qqtools-types/antd';
import { requestRoomId, type RoomIdObj } from '@qqtools-api/48/jsdelivrCDN';
import { showOpenDialog } from '../../../utils/remote/dialog';
import { saveRoomId, deleteRoomId } from '../reducers/options';
import type { MemberInfo } from '../../../commonTypes';

// 下载列表文件
function handleDownloadRoomIdJsonClick(event: MouseEvent<HTMLAnchorElement>): void {
  shell.openExternal('https://raw.githubusercontent.com/duan602728596/qqtools/main/packages/NIMTest/node/roomId.json');
}

// 通过jsdelivr下载列表文件
function handleDownloadRoomIdJsonJsdelivrClick(event: MouseEvent<HTMLAnchorElement>): void {
  shell.openExternal('https://fastly.jsdelivr.net/gh/duan602728596/qqtools@main/packages/NIMTest/node/roomId.json');
}

/* 房间信息导入 */
function RoomId(props: {}): ReactElement {
  const dispatch: Dispatch = useDispatch();
  const [messageApi, messageContextHolder]: UseMessageReturnType = message.useMessage();
  const [visible, setVisible]: [boolean, D<S<boolean>>] = useState(false);
  const [loading, setLoading]: [boolean, D<S<boolean>>] = useState(false);

  // 通过api导入文件
  async function handleImportRoomIdJsonFromAPIClick(event: MouseEvent): Promise<void> {
    setLoading(true);

    try {
      const res: RoomIdObj = await requestRoomId();

      if (res?.roomId?.length) {
        dispatch(saveRoomId({
          data: {
            name: 'roomId',
            value: res.roomId
          }
        }));
        messageApi.success('房间信息导入成功！');
      } else {
        messageApi.error('房间信息导入失败！');
      }
    } catch (err) {
      console.error(err);
      messageApi.error('房间信息导入失败！');
    }

    setLoading(false);
  }

  // 导入文件
  async function handleImportRoomIdJsonClick(event: MouseEvent): Promise<void> {
    const result: OpenDialogReturnValue = await showOpenDialog({
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
      messageApi.success('房间信息导入成功！');
      setVisible(false);
    } catch (err) {
      console.error(err);
      messageApi.error('房间信息导入失败！');
    }
  }

  // 删除文件
  function handleDeleteRoomIdJsonClick(event: MouseEvent): void {
    dispatch(deleteRoomId({
      query: 'roomId'
    }));
    messageApi.success('已删除房间信息，你可以重新导入。');
  }

  return (
    <Fragment>
      <Button onClick={ (event: MouseEvent): void => setVisible(true) }>导入房间信息</Button>
      <Modal open={ visible }
        width={ 600 }
        centered={ true }
        maskClosable={ false }
        footer={ <Button onClick={ (event: MouseEvent): void => setVisible(false) }>关闭</Button> }
        onCancel={ (event: MouseEvent): void => setVisible(false) }
      >
        <div className="h-[160px]">
          <Space className="mb-[16px]">
            <Button onClick={ handleImportRoomIdJsonClick }>本地JSON文件导入房间信息</Button>
            <Button loading={ loading } onClick={ handleImportRoomIdJsonFromAPIClick }>API导入房间信息</Button>
            <Button type="primary" danger={ true } onClick={ handleDeleteRoomIdJsonClick }>清除房间信息</Button>
          </Space>
          <Alert type="info" message={ [
            '如果想要监听房间出入信息，必须先导入房间的信息列表。',
            <a key="download" role="button" aria-label="点击下载" onClick={ handleDownloadRoomIdJsonClick }>点击下载</a>,
            '列表文件，无法翻墙的用户可以在',
            <a key="download2" role="button" aria-label="点击下载" onClick={ handleDownloadRoomIdJsonJsdelivrClick }>jsdelivr下载</a>,
            '。',
            <br key="br" />,
            '或者直接通过请求API导入房间信息。'
          ] } />
        </div>
      </Modal>
      { messageContextHolder }
    </Fragment>
  );
}

export default RoomId;