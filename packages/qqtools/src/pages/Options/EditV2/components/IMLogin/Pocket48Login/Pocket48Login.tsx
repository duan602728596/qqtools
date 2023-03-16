import {
  Fragment,
  useState,
  useEffect,
  type ReactElement,
  type Dispatch as D,
  type SetStateAction as S,
  type MouseEvent
} from 'react';
import * as PropTypes from 'prop-types';
import { Button, Modal, Form, Input, message, type FormInstance } from 'antd';
import type { UseMessageReturnType } from '@qqtools-types/antd';
import style from './pocket48Login.sass';
import SMS from './SMS';
import { requestSMS, requestMobileCodeLogin, requestImUserInfo } from '../../../../services/services';
import type { SMSResult, LoginUserInfo, IMUserInfo } from '../../../../services/interface';

const sms: SMS = new SMS();

interface LoginModalProps {
  form: FormInstance;
  onLoginSuccess?: Function;
}

/* 口袋48登录 */
function Pocket48Login(props: LoginModalProps): ReactElement {
  const { form: fatherForm, onLoginSuccess }: LoginModalProps = props;
  const [messageApi, messageContextHolder]: UseMessageReturnType = message.useMessage();
  const [open, setOpen]: [boolean, D<S<boolean>>] = useState(false);
  const [loading, setLoading]: [boolean, D<S<boolean>>] = useState(false);
  const [second, setSecond]: [number, D<S<number>>] = useState(sms.time);
  const [form]: [FormInstance] = Form.useForm();

  // 登录并保存token
  async function handleLoginClick(event: MouseEvent): Promise<void> {
    let value: { area: string; mobile: string; code: string };

    try {
      value = await form.validateFields();
    } catch {
      return;
    }

    setLoading(true);

    try {
      const loginRes: LoginUserInfo = await requestMobileCodeLogin(value.mobile, value.code);

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
        setOpen(false);
      } else {
        messageApi.error('获取IM信息失败！');
      }
    } catch (err) {
      console.error(err);
      messageApi.error('登录中出现错误，登录失败！');
    }
  }

  // 发送验证码
  async function handleSendSMSCodeClick(event: MouseEvent): Promise<void> {
    let value: { area: string; mobile: string };

    try {
      value = await form.validateFields(['area', 'mobile']);
    } catch {
      return;
    }

    sms.start();

    try {
      const res: SMSResult = await requestSMS(value.mobile, value.area);

      if (!res.success) {
        messageApi.error('验证码发送失败！');

        return;
      }
    } catch (err) {
      console.error(err);
      messageApi.error('验证码发送失败！');
    }
  }

  // 更新验证码
  function handleSMSUpdate(event: Event): void {
    setSecond(event['data']);
  }

  useEffect(function(): () => void {
    document.addEventListener(sms.event.type, handleSMSUpdate);

    return function(): void {
      document.removeEventListener(sms.event.type, handleSMSUpdate);
    };
  }, []);

  return (
    <Fragment>
      <Button className="mt-[8px]" onClick={ (event: MouseEvent): void => setOpen(true) }>口袋48登录</Button>
      <Modal title="口袋48登录"
        open={ open }
        width={ 400 }
        centered={ true }
        destroyOnClose={ true }
        closable={ false }
        maskClosable={ false }
        confirmLoading={ loading }
        afterClose={ form.resetFields }
        okText="登录"
        onOk={ handleLoginClick }
        onCancel={ (event: MouseEvent): void => setOpen(false) }
      >
        <Form form={ form } initialValues={{ area: '86' }} labelCol={{ span: 5 }} wrapperCol={{ span: 19 }}>
          <Form.Item className={ style.formItem } label="手机" required={ true }>
            <div className="flex">
              <div className="w-[90px]">
                <Form.Item name="area" rules={ [{ required: true, message: '请输入地区' }] } noStyle={ true }>
                  <Input prefix="+" />
                </Form.Item>
              </div>
              <div className="flex-grow ml-[8px]">
                <Form.Item name="mobile" rules={ [{ required: true, message: '请输入手机号' }] } noStyle={ true }>
                  <Input />
                </Form.Item>
              </div>
            </div>
          </Form.Item>
          <Form.Item className={ style.formItem } label="验证码" required={ true }>
            <div className="flex">
              <div className="flex-grow mr-[8px]">
                <Form.Item name="code" rules={ [{ required: true, message: '请输入验证码' }] } noStyle={ true }>
                  <Input />
                </Form.Item>
              </div>
              <Button className="w-[120px]" disabled={ second !== 0 } onClick={ handleSendSMSCodeClick }>
                { second === 0 ? '发送验证码' : `${ second }秒` }
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
      { messageContextHolder }
    </Fragment>
  );
}

Pocket48Login.propTypes = {
  form: PropTypes.object,
  onLoginSuccess: PropTypes.func
};

export default Pocket48Login;