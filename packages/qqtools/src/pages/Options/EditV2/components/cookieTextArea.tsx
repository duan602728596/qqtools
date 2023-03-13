import {
  Fragment,
  useState,
  type ReactElement,
  type Dispatch as D,
  type SetStateAction as S,
  type ChangeEvent,
  type MouseEvent
} from 'react';
import { Input, Button, message, type FormInstance } from 'antd';
import type { UseMessageReturnType } from '@qqtools-types/antd';
import type { CustomComponentFuncArgs, StringItem } from 'antd-schema-form/es/types';
import { requestAwemePost } from '../../../../QQ/services/douyin';
import * as editV2SchemaJson from '../editv2.schema.json' assert { type: 'json' };
import * as toutiaosdk from '../../../../QQ/sdk/toutiao/toutiaosdk';
import type { AwemePostResponse } from '../../../../QQ/services/interface';

const schema: Record<string, any> = editV2SchemaJson;
const [userId, webId, cookieString]: [string, string, string] = [
  schema['properties']['douyin']['items']['properties']['userId']['id'],
  schema['properties']['douyin']['items']['properties']['webId']['id'],
  schema['properties']['douyin']['items']['properties']['cookieString']['id']
];

interface CookieTextAreaComponentProps {
  form: FormInstance;
  root: StringItem;
  id?: string;
  value?: string;
  onChange?: Function;
}

function CookieTextAreaComponent(props: CookieTextAreaComponentProps): ReactElement {
  const { form, root, id, value, onChange }: CookieTextAreaComponentProps = props;
  const [messageApi, messageContextHolder]: UseMessageReturnType = message.useMessage();
  const [loading, setLoading]: [boolean, D<S<boolean>>] = useState(false);

  // 验证是否能获取到数据
  async function handleVerifyGetDataSuccessClick(event: MouseEvent): Promise<void> {
    try {
      const formValue: Record<string, string> = form.getFieldsValue([userId, webId, cookieString]);

      if (
        formValue[userId]
        && !/^\s*$/.test(formValue[userId])
        && formValue[webId]
        && !/^\s*$/.test(formValue[webId])
        && formValue[cookieString]
        && !/^\s*$/.test(formValue[cookieString])
      ) {
        setLoading(true);

        const frontierSign: { 'X-Bogus'?: string } = {};

        await toutiaosdk.webmssdkES5('frontierSign', [frontierSign]);

        const res: AwemePostResponse = await requestAwemePost(formValue[cookieString], {
          secUserId: formValue[userId],
          webId: formValue[cookieString]
        }, frontierSign['X-Bogus']!);

        console.log('AwemePostResponse:', res);

        if (res?.aweme_list) {
          messageApi.success('填写正确，成功获取到数据！');
        } else {
          messageApi.error('没有获取到数据，请检查填写是否正确。');
        }
      }
    } catch (err) {
      console.error(err);
      messageApi.error('出现错误，请检查。');
    }

    setLoading(false);
  }

  // input change
  function handleInputChange(event: ChangeEvent): void {
    onChange!(event.target['value']);
  }

  return (
    <Fragment>
      <Input.TextArea className="block mb-[8px]"
        id={ id }
        value={ value }
        rows={ 8 }
        placeholder={ root.$placeholder }
        onChange={ handleInputChange }
      />
      <Button type="primary" loading={ loading } onClick={ handleVerifyGetDataSuccessClick }>点击验证是否能够获取到数据</Button>
      { messageContextHolder }
    </Fragment>
  );
}

/* 填写cookie，并允许验证 */
function cookieTextArea({ root, form, required }: CustomComponentFuncArgs<StringItem>): ReactElement {
  return <CookieTextAreaComponent form={ form } root={ root } />;
}

export default cookieTextArea;