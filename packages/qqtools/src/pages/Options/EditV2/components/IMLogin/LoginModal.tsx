import { Fragment, useState, type ReactElement, type Dispatch as D, type SetStateAction as S, type MouseEvent } from 'react';
import * as PropTypes from 'prop-types';
import { Button, Modal, Form, Input, message, type FormInstance } from 'antd';
import type { UseMessageReturnType } from '@qqtools-types/antd';
import { requestPocketLogin, requestImUserInfo } from '../../../services/services';
import type { LoginInfo, IMUserInfo } from '../../../services/interface';

interface LoginModalProps {
  form: FormInstance;
  onLoginSuccess?: Function;
}

/* 账号登陆 */
function LoginModal(props: LoginModalProps): ReactElement {
  const { form: fatherForm, onLoginSuccess }: LoginModalProps = props;
  const [messageApi, messageContextHolder]: UseMessageReturnType = message.useMessage();
  const [visible, setVisible]: [boolean, D<S<boolean>>] = useState(false),
    [loading, setLoading]: [boolean, D<S<boolean>>] = useState(false);
  const [form]: [FormInstance] = Form.useForm();

  // 点击显示modal
  function handleOpenModalClick(event: MouseEvent): void {
    setVisible(true);
  }

  // 关闭modal
  function handleCloseModalClick(event: MouseEvent): void {
    setVisible(false);
  }

  // 确认登陆
  async function handleLoginClick(event: MouseEvent): Promise<void> {
    let formValue: { mobile: string; pwd: string };

    try {
      formValue = await form.validateFields();
    } catch (err) {
      return console.error(err);
    }

    setLoading(true);

    try {
      const loginRes: LoginInfo = await requestPocketLogin(formValue.pwd, formValue.mobile);

      console.log('口袋账号登陆：', loginRes);

      let token: string;

      if (loginRes.status === 200) {
        token = loginRes.content.userInfo.token;
      } else {
        setLoading(false);

        messageApi.error('口袋账号登陆失败！');

        return;
      }

      const imUserInfoRes: IMUserInfo = await requestImUserInfo(token);

      console.log('IM信息：', imUserInfoRes);

      if (imUserInfoRes.status === 200) {
        (onLoginSuccess ?? fatherForm.setFieldsValue)({
          pocket48Account: imUserInfoRes.content.accid,
          pocket48Token: imUserInfoRes.content.pwd
        });
        setVisible(false);
      } else {
        messageApi.error('获取IM信息失败！');
      }
    } catch (err) {
      console.error(err);
      messageApi.error('登陆失败！');
    }

    setLoading(false);
  }

  return (
    <Fragment>
      <Button className="mt-[14px]" onClick={ handleOpenModalClick }>登陆并获取口袋48的IM信息</Button>
      <Modal title="登陆并获取IM信息"
        open={ visible }
        width={ 400 }
        centered={ true }
        destroyOnClose={ true }
        closable={ false }
        confirmLoading={ loading }
        afterClose={ form.resetFields }
        onOk={ handleLoginClick }
        onCancel={ handleCloseModalClick }
      >
        <Form className="h-[120px]" form={ form } labelCol={{ span: 5 }} wrapperCol={{ span: 19 }}>
          <Form.Item name="mobile" label="用户名" rules={ [{ required: true, message: '请输入用户名', whitespace: true }] }>
            <Input />
          </Form.Item>
          <Form.Item name="pwd" label="密码" rules={ [{ required: true, message: '请输入密码', whitespace: true }] }>
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
      { messageContextHolder }
    </Fragment>
  );
}

LoginModal.propTypes = {
  form: PropTypes.object,
  onLoginSuccess: PropTypes.func
};

export default LoginModal;