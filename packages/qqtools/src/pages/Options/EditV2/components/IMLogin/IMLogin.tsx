import { Fragment, type ReactElement, ChangeEvent } from 'react';
import * as PropTypes from 'prop-types';
import { Input, type FormInstance } from 'antd';
import type { CustomComponentFuncArgs, StringItem } from 'antd-schema-form/es/types';
import Pocket48Login from './Pocket48Login/Pocket48Login';
// @ts-ignore
import editV2SchemaJson from '../../editv2.schema.json' assert { type: 'json' };

interface LogDirProps {
  form: FormInstance;
  id?: string;
  value?: string;
  onChange?: Function;
}

function IMLoginComponent(props: LogDirProps): ReactElement {
  const { form, id, value, onChange }: LogDirProps = props;
  const isV2: boolean | undefined = id?.includes?.('/pocket48V2/');
  const pocket48Key: string = isV2 ? 'pocket48V2' : 'pocket48';

  // input
  function handleInputChange(event: ChangeEvent): void {
    onChange!(event.target['value']);
  }

  // 登录并获取口袋48的IM信息
  function handleLoginAndSetFormCallback(result: { pocket48Account: string; pocket48Token: string }): void {
    form.setFieldsValue({
      [editV2SchemaJson.properties[pocket48Key].items.properties.pocket48Account.id]: result.pocket48Account,
      [editV2SchemaJson.properties[pocket48Key].items.properties.pocket48Token.id]: result.pocket48Token
    });
  }

  return (
    <Fragment>
      <Input id={ id } value={ value } onChange={ handleInputChange } />
      <Pocket48Login form={ form } onLoginSuccess={ handleLoginAndSetFormCallback } />
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