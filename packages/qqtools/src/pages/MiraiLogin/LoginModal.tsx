import { Fragment, ReactElement, useState, Dispatch as D, SetStateAction as S, MouseEvent } from 'react';
import { Button, Modal, Form, Checkbox, Input, message } from 'antd';
import type { FormInstance } from 'antd/es/form';
import { Queue } from '@bbkkbkk/q';
import style from './loginModal.sass';
import { login } from './login/login';

const queue: Queue = new Queue({ workerLen: 1 }); // 用来限制登陆的

interface FormValue {
  username: string;
  password: string;
  remember?: boolean;
}

/* 账号登陆 */
function LoginModal(props: {}): ReactElement {
  const [visible, setVisible]: [boolean, D<S<boolean>>] = useState(false); // 登陆
  const [loginLoading, setLoginLoading]: [boolean, D<S<boolean>>] = useState(false); // loading
  const [form]: [FormInstance] = Form.useForm();

  // 登陆
  async function loginFunc(value: FormValue): Promise<void> {
    try {
      const result: boolean = await login(value.username, value.password);

      if (result) {
        message.success(`[${ value.username }] 登陆成功！`);
      } else {
        message.error(`[${ value.username }] 登陆失败！`);
      }
    } catch (err) {
      console.error(err);
      message.error('登陆失败！');
    }

    setLoginLoading(false);
  }

  // 登陆
  function handleLoginSubmit(value: FormValue): void {
    setLoginLoading(true);

    queue.use([loginFunc, undefined, value]);
    queue.run();
  }

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
        confirmLoading={ loginLoading }
        onCancel={ handleCloseLoginModalClick }
      >
        <Form className={ style.form }
          form={ form }
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 20 }}
          onFinish={ handleLoginSubmit }
        >
          <Form.Item name="username" label="账号" rules={ [{ required: true, message: '必须填写账号', whitespace: true }] }>
            <Input />
          </Form.Item>
          <Form.Item name="password" label="密码" rules={ [{ required: true, message: '必须填写密码', whitespace: true }] }>
            <Input.Password />
          </Form.Item>
          <Form.Item name="remember" label="记住密码" valuePropName="checked">
            <Checkbox />
          </Form.Item>
        </Form>
      </Modal>
    </Fragment>
  );
}

export default LoginModal;