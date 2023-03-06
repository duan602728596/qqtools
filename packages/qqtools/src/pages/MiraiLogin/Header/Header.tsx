import type { OpenDialogReturnValue } from 'electron';
import { Fragment, useEffect, ReactElement, type MouseEvent } from 'react';
import { Button, Input, Form, Divider, message } from 'antd';
import type { FormInstance } from 'antd/es/form';
import type { UseMessageReturnType } from '@qqtools-types/antd';
import { showOpenDialog } from '../../../utils/remote/dialog';
import { getMclDir, setMclDir } from '../function/miraiPath';

/* 返回、表单配置 */
function Header(props: {}): ReactElement {
  const [form]: [FormInstance] = Form.useForm();
  const { setFieldsValue, getFieldsValue }: FormInstance = form;
  const [messageApi, messageContextHolder]: UseMessageReturnType = message.useMessage();

  // 选择mcl文件夹的位置
  async function handleSelectJarDirClick(event: MouseEvent): Promise<void> {
    const result: OpenDialogReturnValue = await showOpenDialog({
      properties: ['openDirectory']
    });

    if (result.canceled || !result.filePaths || result.filePaths.length === 0) return;

    form.setFieldsValue({
      mclDir: result.filePaths[0]
    });
  }

  // 修改配置
  function handleSubmit(event: MouseEvent): void {
    const { mclDir }: { mclDir: string | null | undefined } = getFieldsValue();

    setMclDir(mclDir);
    messageApi.success('配置修改成功！');
  }

  useEffect(function(): void {
    setFieldsValue({
      mclDir: getMclDir()
    });
  }, []);

  return (
    <Fragment>
      <Form className="mb-[16px]" form={ form }>
        <label className="inline-block w-[125px]" htmlFor="mclDir">mcl的文件夹地址：</label>
        <Form.Item name="mclDir" noStyle={ true }>
          <Input className="mr-[8px] w-[300px]" id="mclDir" allowClear={ true } />
        </Form.Item>
        <Button className="w-[105px]" onClick={ handleSelectJarDirClick }>选择文件夹</Button>
        <Button className="ml-[16px]" type="primary" onClick={ handleSubmit }>保存</Button>
      </Form>
      <Divider />
      { messageContextHolder }
    </Fragment>
  );
}

export default Header;