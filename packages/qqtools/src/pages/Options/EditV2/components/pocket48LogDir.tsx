import type { OpenDialogReturnValue } from 'electron';
import type { ReactElement, MouseEvent } from 'react';
import * as PropTypes from 'prop-types';
import { Space, Input, Button, type FormInstance } from 'antd';
import type { CustomComponentFuncArgs, StringItem } from 'antd-schema-form/es/types';
import { showOpenDialog } from '../../../../utils/remote/dialog';

interface LogDirProps {
  form: FormInstance;
  root: StringItem;
  id?: string;
  value?: string;
  onChange?: Function;
}

function LogDir(props: LogDirProps): ReactElement {
  const { form, root, id, value, onChange }: LogDirProps = props;

  // 选择日志保存位置
  async function handleLogSaveDirClick(event: MouseEvent): Promise<void> {
    const result: OpenDialogReturnValue = await showOpenDialog({
      properties: ['openDirectory']
    });

    if (result.canceled || !result.filePaths || result.filePaths.length === 0) return;

    onChange!(result.filePaths[0]);
  }

  // 清除保存位置
  function handleLogSaveDirResetClick(event: MouseEvent): void {
    form.resetFields([root.id]);
  }

  return (
    <Space>
      <Input id={ id } value={ value } readOnly={ true } />
      <Button onClick={ handleLogSaveDirClick }>选择日志保存位置</Button>
      <Button type="primary" danger={ true } onClick={ handleLogSaveDirResetClick }>清除</Button>
    </Space>
  );
}

LogDir.propTypes = {
  form: PropTypes.object.isRequired,
  root: PropTypes.object.isRequired,
  id: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func
};

/* 选择日志保存位置 */
function pocket48LogDir({ root, form, required }: CustomComponentFuncArgs<StringItem>): ReactElement {
  return <LogDir form={ form } root={ root } />;
}

export default pocket48LogDir;