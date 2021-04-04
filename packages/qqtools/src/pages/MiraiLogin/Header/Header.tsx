import type { OpenDialogReturnValue } from 'electron';
import { dialog } from '@electron/remote';
import { Fragment, useEffect, ReactElement, MouseEvent } from 'react';
import { Button, Space, Input, Form, Divider, message } from 'antd';
import type { FormInstance } from 'antd/es/form';
import style from './header.sass';
import { getJarDir, setJarDir, getJavaPath, setJavaPath } from '../miraiPath';

/* 返回、表单配置 */
function Header(props: {}): ReactElement {
  const [form]: [FormInstance] = Form.useForm();
  const { setFieldsValue, getFieldsValue }: FormInstance = form;

  // 选择jar文件夹的位置
  async function handleSelectJarDirClick(event: MouseEvent<HTMLButtonElement>): Promise<void> {
    const result: OpenDialogReturnValue = await dialog.showOpenDialog({
      properties: ['openDirectory']
    });

    if (result.canceled || !result.filePaths || result.filePaths.length === 0) return;

    form.setFieldsValue({
      jarDir: result.filePaths[0]
    });
  }

  // 选择jdk文件的位置
  async function handleSelectJdkPathClick(event: MouseEvent<HTMLButtonElement>): Promise<void> {
    const result: OpenDialogReturnValue = await dialog.showOpenDialog({
      properties: ['openFile']
    });

    if (result.canceled || !result.filePaths || result.filePaths.length === 0) return;

    form.setFieldsValue({
      javaPath: result.filePaths[0]
    });
  }

  // 修改配置
  function handleSubmit(event: MouseEvent<HTMLButtonElement>): void {
    const { jarDir, javaPath }: { jarDir: string | undefined; javaPath: string | undefined } = getFieldsValue();

    setJarDir(jarDir);
    setJavaPath(javaPath);
    message.success('配置修改成功！');
  }

  useEffect(function(): void {
    setFieldsValue({
      jarDir: getJarDir(),
      javaPath: getJavaPath()
    });
  }, []);

  return (
    <Fragment>
      <Form className={ style.marginBottom } form={ form }>
        <Space direction="vertical">
          <div>
            <label className={ style.label } htmlFor="jarDir">jar的文件夹地址：</label>
            <Form.Item name="jarDir" noStyle={ true }>
              <Input className={ style.input } id="jarDir" allowClear={ true } />
            </Form.Item>
            <Button onClick={ handleSelectJarDirClick }>选择文件夹</Button>
          </div>
          <div>
            <label className={ style.label } htmlFor="javaPath">java的文件地址：</label>
            <Form.Item name="javaPath" noStyle={ true }>
              <Input className={ style.input } id="javaPath" allowClear={ true } />
            </Form.Item>
            <Button className={ style.marginRight32 } onClick={ handleSelectJdkPathClick }>选择文件</Button>
            <Button type="primary" onClick={ handleSubmit }>保存</Button>
          </div>
        </Space>
      </Form>
      <Divider />
    </Fragment>
  );
}

export default Header;