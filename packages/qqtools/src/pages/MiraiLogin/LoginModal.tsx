import { Fragment, ReactElement, useState, Dispatch as D, SetStateAction as S, MouseEvent } from 'react';
import { useDispatch } from 'react-redux';
import type { Dispatch } from '@reduxjs/toolkit';
import { Button, Modal, Form, Checkbox, Input, message, Select } from 'antd';
import type { FormInstance } from 'antd/es/form';
import type { UseMessageReturnType } from '@qqtools-types/antd';
import * as dayjs from 'dayjs';
import { login, queue } from './function/login/login';
import { saveQQLoginItemData } from './reducers/reducers';
import type { LoginInfoSendMessage } from './function/login/miraiChild.worker/miraiChild.worker';
import type { ProtocolType } from './types';

interface FormValue {
  username: string;
  password: string;
  remember?: boolean;
  protocol?: ProtocolType;
}

/* 账号登陆 */
function LoginModal(props: {}): ReactElement {
  const dispatch: Dispatch = useDispatch();
  const [messageApi, messageContextHolder]: UseMessageReturnType = message.useMessage();
  const [visible, setVisible]: [boolean, D<S<boolean>>] = useState(false); // 登陆
  const [loginLoading, setLoginLoading]: [boolean, D<S<boolean>>] = useState(false); // loading
  const [form]: [FormInstance] = Form.useForm();

  // 登陆
  async function loginFunc(value: FormValue): Promise<void> {
    try {
      const [result, loginInfoSendMessage]: [boolean, LoginInfoSendMessage]
        = await login(value.username, value.password, value.protocol);

      if (result) {
        if (value.remember) {
          dispatch(saveQQLoginItemData({
            data: {
              qq: value.username,
              lastLoginTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
              password: value.password,
              autoLogin: true,
              protocol: value.protocol
            }
          }));
        }

        setVisible(false);
        messageApi.success(`[${ value.username }] 登录成功！`);
      } else {
        messageApi.error(`[${ value.username }] ${ loginInfoSendMessage?.message ?? '登陆失败！' }`);
      }
    } catch (err) {
      console.error(err);
      messageApi.error('登陆失败！');
    }

    setLoginLoading(false);
  }

  // 登陆
  async function handleLoginSubmit(event: MouseEvent): Promise<void> {
    let value: FormValue;

    try {
      value = await form.validateFields();
    } catch (err) {
      return console.error(err);
    }

    setLoginLoading(true);

    queue.use([loginFunc, undefined, value]);
    queue.run();
  }

  // 打开弹出层
  function handleOpenLoginModalClick(event: MouseEvent): void {
    setVisible(true);
  }

  // 关闭弹出层
  function handleCloseLoginModalClick(event: MouseEvent): void {
    setVisible(false);
  }

  return (
    <Fragment>
      <Button type="primary" onClick={ handleOpenLoginModalClick }>账号登陆</Button>
      <Modal title="账号登陆"
        open={ visible }
        width={ 500 }
        centered={ true }
        destroyOnClose={ true }
        closable={ false }
        maskClosable={ false }
        confirmLoading={ loginLoading }
        afterClose={ form.resetFields }
        onOk={ handleLoginSubmit }
        onCancel={ handleCloseLoginModalClick }
      >
        <Form className="h-[200px]"
          form={ form }
          initialValues={{ protocol: 'ANDROID_PAD' }}
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 20 }}
        >
          <Form.Item name="username" label="账号" rules={ [{ required: true, message: '必须填写账号', whitespace: true }] }>
            <Input />
          </Form.Item>
          <Form.Item name="password" label="密码" rules={ [{ required: true, message: '必须填写密码', whitespace: true }] }>
            <Input.Password />
          </Form.Item>
          <Form.Item name="protocol" label="登陆协议">
            <Select>
              <Select.Option value="ANDROID_PAD">平板(ANDROID_PAD)</Select.Option>
              <Select.Option value="ANDROID_PHONE">手机(ANDROID_PHONE)</Select.Option>
              <Select.Option value="ANDROID_WATCH">手表(ANDROID_WATCH)</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="remember" label="记住账号" valuePropName="checked">
            <Checkbox />
          </Form.Item>
        </Form>
      </Modal>
      { messageContextHolder }
    </Fragment>
  );
}

export default LoginModal;