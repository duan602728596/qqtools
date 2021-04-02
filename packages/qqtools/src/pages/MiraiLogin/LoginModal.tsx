import { Fragment, ReactElement, useState, Dispatch as D, SetStateAction as S, MouseEvent } from 'react';
import { Button, Modal, Form, Checkbox, Input } from 'antd';
import type { FormInstance } from 'antd/es/form';
import style from './loginModal.sass';

/* 账号登陆 */
function LoginModal(props: {}): ReactElement {
  const [visible, setVisible]: [boolean, D<S<boolean>>] = useState(false); // 登陆
  const [form]: [FormInstance] = Form.useForm();

  // 打开弹出层
  function handleOpenLoginModalClick(event: MouseEvent<HTMLButtonElement>): void {
    setVisible(true);
  }

  // 关闭弹出层
  function handleCloseLoginModalClick(event: MouseEvent<HTMLButtonElement>): void {
    setVisible(false);
  }

  return (
    <Fragment>
      <Button onClick={ handleOpenLoginModalClick }>账号登陆</Button>
      <Modal title="账号登陆"
        visible={ visible }
        width={ 500 }
        centered={ true }
        destroyOnClose={ true }
        closable={ false }
        onCancel={ handleCloseLoginModalClick }
      >
        <Form className={ style.form } labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
          <Form.Item name="username" label="账号" rules={ [{ required: true, message: '必须填写账号', whitespace: true }] }>
            <Input />
          </Form.Item>
          <Form.Item name="password" label="密码" rules={ [{ required: true, message: '必须填写密码', whitespace: true }] }>
            <Input.Password />
          </Form.Item>
          <Form.Item name="remember " label="记住密码" valuePropName="checked">
            <Checkbox />
          </Form.Item>
        </Form>
      </Modal>
    </Fragment>
  );
}

export default LoginModal;