import { Fragment, type ReactElement, type ChangeEvent, type MouseEvent } from 'react';
import { Input, Button, Space, message, type FormInstance } from 'antd';
import type { UseMessageReturnType } from '@qqtools-types/antd';
import * as editV2SchemaJson from '../editv2.schema.json' assert { type: 'json' };
import DouyinExpand from '../../../../QQ/function/expand/douyin/DouyinExpand';
import type { CustomComponentFuncArgs, StringItem } from 'antd-schema-form/es/types';
import type { UserScriptRendedData, UserItem1, UserItem2 } from '../../../../QQ/qq.types';

const schema: Record<string, any> = editV2SchemaJson;

interface WebIdComponentProps {
  form: FormInstance;
  id?: string;
  value?: string;
  onChange?: Function;
}

function WebIdComponent(props: WebIdComponentProps): ReactElement {
  const { form, id, value, onChange }: WebIdComponentProps = props;
  const [messageApi, messageContextHolder]: UseMessageReturnType = message.useMessage();

  // 点击获取webId
  async function handleGetWebIdClick(event: MouseEvent): Promise<void> {
    // 无头浏览器请求cookie
    const executablePath: string | null = localStorage.getItem('PUPPETEER_EXECUTABLE_PATH');

    if (!(executablePath && !/^\s*$/.test(executablePath))) {
      messageApi.warning('请先配置无头浏览器！');

      return;
    }

    const userId: string | undefined = form.getFieldValue(schema['properties']['douyin']['items']['properties']['userId']['id']);

    if (!(userId && !/^\s*$/.test(userId))) {
      messageApi.warning('请先输入userId！');

      return;
    }

    const renderData: UserScriptRendedData | undefined = await DouyinExpand.getRenderData(executablePath, userId);

    if (renderData) {
      const userItemArray: Array<UserItem1 | UserItem2 | string> = Object.values(renderData);
      const userItem1: UserItem1 | undefined = userItemArray.find(
        (o: UserItem1 | UserItem2 | string): o is UserItem1 => typeof o === 'object' && ('odin' in o));

      if (userItem1) {
        onChange!(userItem1.odin.user_unique_id);
      }
    }
  }

  // input
  function handleInputChange(event: ChangeEvent): void {
    onChange!(event.target['value']);
  }

  return (
    <Fragment>
      <Space>
        <Input className="w-[220px]" id={ id } value={ value } onChange={ handleInputChange } />
        <Button onClick={ handleGetWebIdClick }>获取webId</Button>
      </Space>
      { messageContextHolder }
    </Fragment>
  );
}

/* 从userItem1.odin.user_unique_id中请求webid */
function webId({ root, form, required }: CustomComponentFuncArgs<StringItem>): ReactElement {
  return <WebIdComponent form={ form } />;
}

export default webId;