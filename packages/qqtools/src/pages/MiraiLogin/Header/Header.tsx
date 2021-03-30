import { dialog } from '@electron/remote';
import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { Button, Space, Input, Form } from 'antd';
import type { FormInstance } from 'antd/es/form';
import style from './header.sass';

/* 返回、表单配置 */
function Header(props: {}): ReactElement {
  const [form]: [FormInstance] = Form.useForm();

  return (
    <Form className={ style.marginBottom } form={ form }>
      <Space direction="vertical">
        <Link to="/">
          <Button type="primary" danger={ true }>返回</Button>
        </Link>
        <div>
          <label className={ style.label } htmlFor="miraiDir">选择mirai的jar文件夹地址：</label>
          <Form.Item name="miraiDir" noStyle={ true }>
            <Input className={ style.input } id="miraiDir" />
          </Form.Item>
          <Button.Group>
            <Button>选择文件夹</Button>
            <Button type="primary" danger={ true }>清除</Button>
          </Button.Group>
        </div>
        <div>
          <label className={ style.label } htmlFor="jdkPath">选择jdk的文件地址：</label>
          <Form.Item name="jdkPath" noStyle={ true }>
            <Input className={ style.input } id="jdkPath" />
          </Form.Item>
          <Button.Group>
            <Button>选择文件</Button>
            <Button type="primary" danger={ true }>清除</Button>
          </Button.Group>
        </div>
      </Space>
    </Form>
  );
}

export default Header;