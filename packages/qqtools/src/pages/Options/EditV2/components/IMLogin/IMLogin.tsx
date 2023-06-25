import { Fragment, type ReactElement, type MouseEvent, type ChangeEvent } from 'react';
import * as PropTypes from 'prop-types';
import { Input, Space, Button, message, type FormInstance } from 'antd';
import type { UseMessageReturnType } from '@qqtools-types/antd';
import type { CustomComponentFuncArgs, StringItem } from 'antd-schema-form/es/types';
import { CopyTwoTone as IconCopyTwoTone, SnippetsTwoTone as IconSnippetsTwoTone } from '@ant-design/icons';
import Pocket48Login from './Pocket48Login/Pocket48Login';
import * as editV2SchemaJson from '../../editv2.schema.json' assert { type: 'json' };

const EditV2SchemaJson: any = editV2SchemaJson['default'];

const IMKey: string = 'IM_cache';

interface IMLoginComponentProps {
  form: FormInstance;
  id?: string;
  value?: string;
  onChange?: Function;
}

function IMLoginComponent(props: IMLoginComponentProps): ReactElement {
  const { form, id, value, onChange }: IMLoginComponentProps = props;
  const [messageApi, messageContextHolder]: UseMessageReturnType = message.useMessage();
  const isV2: boolean | undefined = id?.includes?.('/pocket48V2/');
  const pocket48Key: string = isV2 ? 'pocket48V2' : 'pocket48';

  const [accountKey, tokenKey]: [string, string] = [
    EditV2SchemaJson.properties[pocket48Key].items.properties.pocket48Account.id,
    EditV2SchemaJson.properties[pocket48Key].items.properties.pocket48Token.id
  ];

  // input
  function handleInputChange(event: ChangeEvent): void {
    onChange!(event.target['value']);
  }

  // 登录并获取口袋48的IM信息
  function handleLoginAndSetFormCallback(result: { pocket48Account: string; pocket48Token: string }): void {
    form.setFieldsValue({
      [accountKey]: result.pocket48Account,
      [tokenKey]: result.pocket48Token
    });
  }

  // 复制
  function handleCopyIMClick(event: MouseEvent): void {
    const IMValue: Record<string, string> = form.getFieldsValue([accountKey, tokenKey]);

    sessionStorage.setItem(IMKey, JSON.stringify({
      a: IMValue[accountKey],
      t: IMValue[tokenKey]
    }));
    messageApi.info('已复制IM信息！粘贴可填写已复制信息！');
  }

  // 粘贴
  function handlePasteIMClick(event: MouseEvent): void {
    const IMValue: Record<string, string> = JSON.parse(sessionStorage.getItem(IMKey) ?? '{}');
    const pasteValue: Record<string, string> = {};

    if (IMValue.a && IMValue.t && IMValue.a !== '' && IMValue.t !== '') {
      IMValue.a && IMValue.a !== '' && (pasteValue[accountKey] = IMValue.a);
      IMValue.t && IMValue.t !== '' && (pasteValue[tokenKey] = IMValue.t);

      form.setFieldsValue(pasteValue);
    }
  }

  return (
    <Fragment>
      <Input id={ id } value={ value } onChange={ handleInputChange } />
      <Space className="mt-[8px]">
        <Pocket48Login form={ form } onLoginSuccess={ handleLoginAndSetFormCallback } />
        <Button icon={ <IconCopyTwoTone /> } onClick={ handleCopyIMClick }>复制IM</Button>
        <Button icon={ <IconSnippetsTwoTone /> } onClick={ handlePasteIMClick }>粘贴IM</Button>
      </Space>
      { messageContextHolder }
    </Fragment>
  );
}

IMLoginComponent.propTypes = {
  form: PropTypes.object.isRequired,
  id: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func
};

/* 登录并获取口袋48的IM信息 */
function IMLogin({ root, form, required }: CustomComponentFuncArgs<StringItem>): ReactElement {
  return <IMLoginComponent form={ form } />;
}

export default IMLogin;