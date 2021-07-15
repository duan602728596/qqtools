import { Fragment, useState, ReactElement, Dispatch as D, SetStateAction as S, MouseEvent } from 'react';
import * as PropTypes from 'prop-types';
import { Button, Modal, Form, Input, message, FormInstance } from 'antd';
import style from './loginModal.sass';
import { requestPocketLogin, requestImUserInfo } from '../services/services';
import type { LoginInfo, IMUserInfo } from '../services/interface';

/* 账号登陆 */
function LoginModal(props: { form: FormInstance }): ReactElement {
  const { form: fatherForm }: { form: FormInstance } = props;
  const [visible, setVisible]: [boolean, D<S<boolean>>] = useState(false),
    [loading, setLoading]: [boolean, D<S<boolean>>] = useState(false);
  const [form]: [FormInstance] = Form.useForm();

  // 点击显示modal
  function handleOpenModalClick(event: MouseEvent<HTMLButtonElement>): void {
    setVisible(true);
  }

  // 关闭modal
  function handleCloseModalClick(event: MouseEvent<HTMLButtonElement>): void {
    setVisible(false);
  }

  // 确认登陆
  async function handleLoginClick(event: MouseEvent<HTMLButtonElement>): Promise<void> {
    let formValue: { mobile: string; pwd: string };

    try {
      formValue = await form.validateFields();
    } catch (err) {
      return console.error(err);
    }

    try {
      const loginRes: LoginInfo = await requestPocketLogin(formValue.pwd, formValue.mobile);

      console.log('口袋账号登陆：', loginRes);

      let token: string;

      if (loginRes.status === 200) {
        token = loginRes.content.userInfo.token;
      } else {
        return message.error('口袋账号登陆失败！');
      }

      const imUserInfoRes: IMUserInfo = await requestImUserInfo(token);

      console.log('IM信息：', imUserInfoRes);

      if (imUserInfoRes.status === 200) {
        fatherForm.setFieldsValue({
          pocket48Account: imUserInfoRes.content.accid,
          pocket48Token: imUserInfoRes.content.pwd
        });
        setVisible(false);
      } else {
        message.error('获取IM信息失败！');
      }
    } catch (err) {
      console.error(err);
      message.error('登陆失败！');
    }
  }

  return (
    <Fragment>
      <Button className={ style.marginTop } onClick={ handleOpenModalClick }>登陆并获取口袋48的IM信息</Button>
      <Modal title="登陆并获取IM信息"
        visible={ visible }
        width={ 400 }
        centered={ true }
        destroyOnClose={ true }
        closable={ false }
        afterClose={ form.resetFields }
        onOk={ handleLoginClick }
        onCancel={ handleCloseModalClick }
      >
        <Form className={ style.form } form={ form } labelCol={{ span: 5 }} wrapperCol={{ span: 19 }}>
          <Form.Item name="mobile" label="用户名" rules={ [{ required: true, message: '请输入用户名', whitespace: true }] }>
            <Input />
          </Form.Item>
          <Form.Item name="pwd" label="密码" rules={ [{ required: true, message: '请输入密码', whitespace: true }] }>
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
    </Fragment>
  );
}

LoginModal.propTypes = {
  form: PropTypes.object
};

export default LoginModal;