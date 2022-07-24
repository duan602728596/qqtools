import { randomUUID } from 'node:crypto';
import { useEffect, useRef, type ReactElement, type MouseEvent, type RefObject } from 'react';
import { useDispatch } from 'react-redux';
import type { Dispatch } from '@reduxjs/toolkit';
import { useNavigate, useParams, type NavigateFunction, type Params } from 'react-router-dom';
import SchemaForm, { getObjectFromValue } from 'antd-schema-form';
import 'antd-schema-form/style/antd-schema-form.css';
import type { FormInstance } from 'antd';
import type { Store } from 'rc-field-form/es/interface';
import checkboxDesc from './components/checkboxDesc';
import pocket48LogDir from './components/pocket48LogDir';
import IMLogin from './components/IMLogin';
import randomId from './components/randomId';
import { getOptionItem, saveFormData } from '../reducers/reducers';
import { pick } from '../../../utils/lodash';
import * as editV2SchemaJson from './editv2.schema.json' assert { type: 'json' };
import type { OptionsItem, OptionsItemValue, OptionsItemValueV2 } from '../../../types';

const customComponent: Record<string, Function> = {
  checkboxDesc,
  pocket48LogDir,
  IMLogin,
  randomId
};

/* 配置表单V2 */
function EditV2(props: {}): ReactElement {
  const dispatch: Dispatch = useDispatch();
  const params: Params = useParams();
  const navigate: NavigateFunction = useNavigate();
  const formRef: RefObject<FormInstance> = useRef(null);

  // 数据回填
  async function getData(): Promise<void> {
    if (params?.id) {
      const { result }: { result: OptionsItem } = await dispatch(getOptionItem({
        query: params.id
      }));
      let value: OptionsItemValue | OptionsItemValueV2 = result.value;

      // 数据处理，保证数据的格式
      if (!('version' in result.value)) {
        const formatValue: OptionsItemValueV2 = pick(result.value, [
          'optionName',
          'optionType',
          'qqNumber',
          'groupNumber',
          'socketHost',
          'socketPort',
          'authKey',
          'groupWelcome',
          'groupWelcomeSend',
          'customCmd'
        ]);
        const [pocket48, weibo, bilibili, cronTimer]: Array<Pick<OptionsItemValue, keyof OptionsItemValue>> = [
          pick(result.value, [
            'pocket48RoomListener',
            'pocket48RoomId',
            'pocket48IsAnonymous',
            'pocket48Account',
            'pocket48Token',
            'pocket48LiveAtAll',
            'pocket48ShieldMsgType',
            'pocket48RoomEntryListener',
            'pocket48OwnerOnlineListener',
            'pocket48MemberInfo',
            'pocket48LogSave',
            'pocket48LogDir'
          ]),
          pick(result.value, [
            'weiboListener',
            'weiboUid',
            'weiboAtAll',
            'weiboSuperTopicListener',
            'weiboSuperTopicLfid'
          ]),
          pick(result.value, [
            'bilibiliLive',
            'bilibiliLiveId',
            'bilibiliAtAll'
          ]),
          pick(result.value, [
            'cronJob',
            'cronTime',
            'cronSendData'
          ])
        ];

        Object.values(pocket48).some((o: any): boolean => o !== undefined) && (formatValue.pocket48 = [pocket48]);
        Object.values(weibo).some((o: any): boolean => o !== undefined) && (formatValue.weibo = [weibo]);
        Object.values(bilibili).some((o: any): boolean => o !== undefined) && (formatValue.bilibili = [bilibili]);
        Object.values(cronTimer).some((o: any): boolean => o !== undefined) && (formatValue.cronTimer = [cronTimer]);
        value = formatValue;
        value.version = 'v2';
      }

      formRef.current && formRef.current.setFieldsValue(getObjectFromValue({ $root: value }));
    }
  }

  // 保存
  async function handleSaveClick(form: FormInstance, antdSchemaFormValue: Store): Promise<void> {
    const formValue: Store = antdSchemaFormValue.$root;

    // 获取id或者随机id
    const id: string = params?.id ?? randomUUID();
    const name: string = formValue.optionName;

    // 剔除undefined
    const formatFormValue: Store = Object.keys(formValue).reduce(function(result: Store, key: string): Store {
      if (formValue && formValue[key] !== undefined) {
        result[key] = formValue[key];
      }

      return result;
    }, {});

    await dispatch(saveFormData({
      data: { id, name, value: formatFormValue }
    }));

    navigate('/Options');
  }

  // 返回到上一页
  function handleGoBackClick(event: MouseEvent<HTMLButtonElement>): void {
    navigate('/Options');
  }

  useEffect(function(): void {
    getData();
  }, [params?.id]);

  return (
    <div className="p-[16px]">
      <SchemaForm ref={ formRef }
        json={ editV2SchemaJson }
        customComponent={ customComponent }
        okText="保存"
        cancelText="返回"
        onOk={ handleSaveClick }
        onCancel={ handleGoBackClick }
      />
    </div>
  );
}

export default EditV2;