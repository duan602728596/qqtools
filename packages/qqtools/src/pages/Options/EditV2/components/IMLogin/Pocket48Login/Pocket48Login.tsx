import {
  Fragment,
  useState,
  type ReactElement,
  type Dispatch as D,
  type SetStateAction as S,
  type MouseEvent
} from 'react';
import * as PropTypes from 'prop-types';
import { Button, Modal, Form, message, Tabs, type FormInstance } from 'antd';
import type { UseMessageReturnType } from '@qqtools-types/antd';
import type { Tab } from 'rc-tabs/es/interface';
import LoginForm from './LoginForm/LoginForm';
import TokenForm from './TokenForm/TokenForm';
import { requestMobileCodeLogin, requestImUserInfo } from '../../../../services/services';
import type { LoginUserInfo, IMUserInfo } from '../../../../services/interface';

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
  const [tabsKey, setTabsKey]: [string, D<S<string>>] = useState('loginForm');
  const [loginForm]: [FormInstance] = Form.useForm();
  const [tokenForm]: [FormInstance] = Form.useForm();

  // 获取IM信息
  async function getIMInfo(token: string): Promise<void> {
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
  }

  // 登录并保存token
  async function handleLoginClick(event: MouseEvent): Promise<void> {
    let value: { area: string; mobile: string; code: string };

    try {
      value = await loginForm.validateFields();
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

      await getIMInfo(token);
    } catch (err) {
      console.error(err);
      messageApi.error('登录中出现错误，登录失败！');
    }
  }

  // 直接用token登录
  async function handleSaveTokenClick(event: MouseEvent): Promise<void> {
    let value: { token: string };

    try {
      value = await tokenForm.validateFields();
      console.log(value);

    } catch {
      return;
    }

    setLoading(true);

    try {
      await getIMInfo(value.token.trim());
    } catch (err) {
      console.error(err);
      messageApi.error('登录中出现错误，登录失败！');
    }
  }

  function afterClose(): void {
    loginForm.resetFields();
    tokenForm.resetFields();
    setTabsKey('loginForm');
  }

  const tabsItem: Array<Tab> = [
    {
      key: 'loginForm',
      label: '验证码登录',
      children: <LoginForm form={ loginForm } />
    },
    {
      key: 'tokenForm',
      label: 'Token',
      children: <TokenForm form={ tokenForm } />
    }
  ];

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
        afterClose={ afterClose }
        okText="登录"
        onOk={ tabsKey === 'tokenForm' ? handleSaveTokenClick : handleLoginClick }
        onCancel={ (event: MouseEvent): void => setOpen(false) }
      >
        <div className="h-[200px]">
          <Tabs type="card" activeKey={ tabsKey } items={ tabsItem } onChange={ (key: string): void => setTabsKey(key) } />
        </div>
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