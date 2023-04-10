import {
  Fragment,
  createElement,
  useState,
  useRef,
  type ReactElement,
  type Dispatch as D,
  type SetStateAction as S,
  type MouseEvent,
  type MutableRefObject
} from 'react';
import * as PropTypes from 'prop-types';
import { Button, Modal, Form, message, Tabs, Select, type FormInstance } from 'antd';
import type { ModalFunc } from 'antd/es/modal/confirm';
import type { UseMessageReturnType, UseModalReturnType, LabeledValue } from '@qqtools-types/antd';
import type { Tab } from 'rc-tabs/es/interface';
import style from './pocket48Login.sass';
import LoginForm from './LoginForm/LoginForm';
import TokenForm from './TokenForm/TokenForm';
import {
  requestMobileCodeLogin,
  requestImUserInfo,
  requestUserInfoReload,
  requestUserInfoSwitch
} from '../../../../services/services';
import type { LoginUserInfo, IMUserInfo, UserInfoReloadOrSwitch, UserItem } from '../../../../services/interface';

function selectOptions(bigUserInfo: UserItem, smallUserInfo: Array<UserItem> = []): Array<LabeledValue> {
  return [{ label: `${ bigUserInfo.nickname }（主要账号）`, value: `${ bigUserInfo.userId }` }].concat(
    smallUserInfo.map((item: UserItem): LabeledValue => ({ label: `${ item.nickname }（小号）`, value: `${ item.userId }` }))
  );
}

interface LoginModalProps {
  form: FormInstance;
  onLoginSuccess?: Function;
}

interface ReloadInfoReturn {
  status: 0 | 1 | 2; // 0 取消 1 有小号 2 无小号
  nickname?: string;
  avatar?: string;
  token?: string;    // switch时返回token
}

/* 口袋48登录 */
function Pocket48Login(props: LoginModalProps): ReactElement {
  const { form: fatherForm, onLoginSuccess }: LoginModalProps = props;
  const [messageApi, messageContextHolder]: UseMessageReturnType = message.useMessage();
  const [modalApi, modalContextHolder]: UseModalReturnType = Modal.useModal();
  const [open, setOpen]: [boolean, D<S<boolean>>] = useState(false);
  const [loading, setLoading]: [boolean, D<S<boolean>>] = useState(false);
  const [tabsKey, setTabsKey]: [string, D<S<string>>] = useState('loginForm');
  const userInfoSelectValueRef: MutableRefObject<string | null> = useRef(null);
  const [loginForm]: [FormInstance] = Form.useForm();
  const [tokenForm]: [FormInstance] = Form.useForm();

  // select
  function handleUserInfoSelect(value: string): void {
    userInfoSelectValueRef.current = value;
  }

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

  /**
   * 根据token获取是否有小号
   * 返回三种状态：无小号，有小号，取消
   */
  function reloadInfo(token: string): Promise<ReloadInfoReturn> {
    return new Promise(async (resolve: Function, reject: Function): Promise<void> => {
      const reload: UserInfoReloadOrSwitch = await requestUserInfoReload(token);

      if (!reload.success) {
        messageApi.error(reload.message);
        resolve({ status: 0 });

        return;
      }

      if (reload.content?.bigSmallInfo?.smallUserInfo?.length) {
        const userIdString: string = String(reload.content.userId);

        userInfoSelectValueRef.current = userIdString;

        // 账号有小号时，额外弹出modal，选择小号
        const m: ReturnType<ModalFunc> = modalApi.confirm({
          title: '请选择你要登录的账号',
          content: (
            <div className="h-[200px]">
              <p className={ style.tips }>
                登录&切换主要账号和小号仍然会踢掉已经登录的账号！
                <br />
                选择粘贴的Token对应的账号则不会踢掉已经登录的账号。
              </p>
              <Select className={ style.select }
                options={ selectOptions(reload.content.bigSmallInfo.bigUserInfo, reload.content.bigSmallInfo.smallUserInfo) }
                defaultValue={ userIdString }
                onSelect={ handleUserInfoSelect }
              />
            </div>
          ),
          width: 400,
          centered: true,
          closable: false,
          maskClosable: false,
          mask: false,
          okText: '选择当前账号',
          onOk(): void {
            if (userIdString === userInfoSelectValueRef.current) {
              // 选择当前账号，直接登录
              resolve({
                status: 1,
                nickname: reload.content.nickname,
                avatar: reload.content.avatar
              });
              userInfoSelectValueRef.current = null;
              m.destroy();
            } else {
              // 选择其他账号，需要switch获取新的token
              requestUserInfoSwitch(token, Number(userInfoSelectValueRef.current)).then((res: UserInfoReloadOrSwitch): void => {
                resolve({
                  status: 2,
                  token: res.content.token,
                  nickname: res.content.nickname,
                  avatar: res.content.avatar
                });
                userInfoSelectValueRef.current = null;
                m.destroy();
              });
            }
          },
          onCancel(): void {
            resolve({ status: 0 });
            userInfoSelectValueRef.current = null;
            m.destroy();
          }
        });
      } else {
        // 账号无小号时，直接使用当前登录的账号信息
        resolve({
          status: 1,
          nickname: reload.content.nickname,
          avatar: reload.content.avatar
        });
      }
    });
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

      if (loginRes.status === 200) {
        const reloadInfoResult: ReloadInfoReturn = await reloadInfo(loginRes.content.userInfo.token);

        if (reloadInfoResult.status === 0) {
          setLoading(false);

          return;
        }

        await getIMInfo(reloadInfoResult.status === 2 && reloadInfoResult.token
          ? reloadInfoResult.token
          : loginRes.content.userInfo.token);
      } else {
        messageApi.error('口袋账号登陆失败！');
      }
    } catch (err) {
      console.error(err);
      messageApi.error('登录中出现错误，登录失败！');
    }

    setLoading(false);
  }

  // 直接用token登录
  async function handleSaveTokenClick(event: MouseEvent): Promise<void> {
    let value: { token: string };

    try {
      value = await tokenForm.validateFields();
    } catch {
      return;
    }

    setLoading(true);

    try {
      const reloadInfoResult: ReloadInfoReturn = await reloadInfo(value.token.trim());

      if (reloadInfoResult.status === 0) {
        setLoading(false);

        return;
      }

      await getIMInfo(reloadInfoResult.status === 2 && reloadInfoResult.token
        ? reloadInfoResult.token : value.token.trim());
    } catch (err) {
      console.error(err);
      messageApi.error('登录中出现错误，登录失败！');
    }

    setLoading(false);
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
      { modalContextHolder }
    </Fragment>
  );
}

Pocket48Login.propTypes = {
  form: PropTypes.object,
  onLoginSuccess: PropTypes.func
};

export default Pocket48Login;