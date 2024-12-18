import { parse, type ParsedPath } from 'node:path';
import { readFile, writeFile } from 'node:fs/promises';
import type { OpenDialogReturnValue } from 'electron';
import { Fragment, useState, useEffect, type ReactElement, type Dispatch as D, type SetStateAction as S, type MouseEvent } from 'react';
import { useNavigate, type NavigateFunction } from 'react-router';
import { Button, Divider, message, Modal } from 'antd';
import type { UseMessageReturnType, UseModalReturnType } from '@qqtools-types/antd';
import { FileFilled as IconFileFilled, SaveFilled as IconSaveFilled } from '@ant-design/icons';
import MonacoEditor from 'react-monaco-editor';
import style from './editor.sass';
import { showOpenDialog } from '../../../utils/remote/dialog';

type EditType = 'yaml' | 'json' | 'javascript';

interface EditInfo {
  filename: string; // 文件
  type: EditType | undefined; // 文件类型
}

/* 编辑器 */
function Editor(props: {}): ReactElement {
  const navigate: NavigateFunction = useNavigate();
  const [messageApi, messageContextHolder]: UseMessageReturnType = message.useMessage();
  const [modalApi, modalContextHolder]: UseModalReturnType = Modal.useModal();
  const [editInfo, setEditInfo]: [EditInfo | undefined, D<S<EditInfo | undefined>>] = useState(undefined);
  const [editValue, setEditValue]: [string, D<S<string>>] = useState('');

  // 保存
  async function save(): Promise<void> {
    if (!editInfo) return;

    try {
      await writeFile(editInfo.filename, editValue, { encoding: 'utf8' });
      messageApi.success('保存成功！');
    } catch (err) {
      console.error(err);
    }
  }

  // 退出前确认是否保存
  function beforeUnload(): Promise<number> {
    return new Promise((resolve: Function, reject: Function): void => {
      modalApi.confirm({
        title: '提示',
        content: '是否保存当前文件？',
        centered: true,
        maskClosable: false,
        onOk(): void {
          save().then((): void => resolve(1));
        },
        onCancel(): void {
          resolve(0);
        }
      });
    });
  }

  // 返回
  async function handleBackClick(event: MouseEvent): Promise<void> {
    if (editInfo) await beforeUnload();

    navigate('/');
  }

  // 快捷键保存
  function handleSaveShortcutKeyUp(event: KeyboardEvent): void {
    if (event.ctrlKey && event.key === 's') save();
  }

  // 按钮保存文件
  function handleSaveClick(event: MouseEvent): void {
    save();
  }

  // 打开文件
  async function handleOpenFileClick(event: MouseEvent): Promise<void> {
    if (editInfo) await beforeUnload();

    const result: OpenDialogReturnValue = await showOpenDialog({
      properties: ['openFile']
    });

    if (result.canceled || !result.filePaths || result.filePaths.length === 0) return;

    const filePath: string = result.filePaths[0];
    const parseResult: ParsedPath = parse(filePath);
    const value: string = await readFile(filePath, 'utf-8');
    let type: EditType | undefined = undefined;

    if (/\.ya?ml/i.test(parseResult.ext)) {
      type = 'yaml';
    } else if (/\.json/i.test(parseResult.ext)) {
      type = 'json';
    } else if (/\.(jsx?|cjs|mjs)/i.test(parseResult.ext)) {
      type = 'javascript';
    }

    setEditInfo({ filename: filePath, type });
    setEditValue(value);
  }

  // 修改文件
  function handleCodeChange(nextValue: string): void {
    setEditValue(nextValue);
  }

  useEffect(function(): () => void {
    document.addEventListener('keyup', handleSaveShortcutKeyUp);

    return function(): void {
      document.removeEventListener('keyup', handleSaveShortcutKeyUp);
    };
  }, [editInfo, editValue]);

  return (
    <Fragment>
      <header className="shrink-0 px-[8px] pt-[8px]">
        <div className="flex">
          <div>
            <Button.Group>
              <Button type="primary" icon={ <IconFileFilled /> } onClick={ handleOpenFileClick }>打开文件</Button>
              <Button icon={ <IconSaveFilled /> } disabled={ !editInfo } onClick={ handleSaveClick }>保存</Button>
              <Button type="primary" danger={ true } onClick={ handleBackClick }>返回</Button>
            </Button.Group>
          </div>
          <p className="grow mb-0 text-[12px] leading-[34px] text-right">支持yaml, json, javascript格式文件。</p>
        </div>
        <Divider className={ style.divider } />
      </header>
      <div className="shrink-0 grow">
        <div className="w-full h-full">
          <MonacoEditor theme="vs-light"
            width="100%"
            height="100%"
            value={ editValue }
            language={ editInfo?.['type'] }
            options={{ fontSize: 14, wordWrap: 'on', automaticLayout: true }}
            onChange={ handleCodeChange }
          />
        </div>
      </div>
      { messageContextHolder }
      { modalContextHolder }
    </Fragment>
  );
}

export default Editor;