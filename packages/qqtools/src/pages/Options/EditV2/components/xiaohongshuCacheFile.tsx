import { randomUUID } from 'node:crypto';
import type { SaveDialogReturnValue } from 'electron';
import type { ReactElement, MouseEvent } from 'react';
import * as PropTypes from 'prop-types';
import { Space, Input, Button, type FormInstance } from 'antd';
import type { CustomComponentFuncArgs, StringItem } from 'antd-schema-form/es/types';
import { showSaveDialog } from '../../../../utils/remote/dialog';

interface CacheFileProps {
  form: FormInstance;
  root: StringItem;
  id?: string;
  value?: string;
  onChange?: Function;
}

function XiaohongshuCacheFile(props: CacheFileProps): ReactElement {
  const { form, root, id, value, onChange }: CacheFileProps = props;

  // 选择日志保存位置
  async function handleLogSaveDirClick(event: MouseEvent): Promise<void> {
    const result: SaveDialogReturnValue = await showSaveDialog({
      defaultPath: `${ randomUUID().replace(/-/g, '') }.json`
    });

    if (result.canceled || !result.filePath) return;

    onChange!(result.filePath);
  }

  // 清除保存位置
  function handleSaveFileResetClick(event: MouseEvent): void {
    form.resetFields([root.id]);
  }

  return (
    <Space>
      <Input id={ id } value={ value } readOnly={ true } />
      <Button onClick={ handleLogSaveDirClick }>选择缓存保存位置</Button>
      <Button type="primary" danger={ true } onClick={ handleSaveFileResetClick }>清除</Button>
    </Space>
  );
}

XiaohongshuCacheFile.propTypes = {
  form: PropTypes.object.isRequired,
  root: PropTypes.object.isRequired,
  id: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func
};

/* 选择日志保存位置 */
function xiaohongshuCacheFile({ root, form, required }: CustomComponentFuncArgs<StringItem>): ReactElement {
  return <XiaohongshuCacheFile form={ form } root={ root } />;
}

export default xiaohongshuCacheFile;