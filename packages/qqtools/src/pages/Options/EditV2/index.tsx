import { randomUUID } from 'node:crypto';
import { useEffect, useRef, type ReactElement, type MouseEvent, type RefObject } from 'react';
import { useDispatch } from 'react-redux';
import type { Dispatch } from '@reduxjs/toolkit';
import { useNavigate, useParams, type NavigateFunction, type Params } from 'react-router-dom';
import SchemaForm, { getObjectFromValue } from 'antd-schema-form';
import type { CustomComponentObject, CustomTableRenderObject, CustomTableRenderFuncArgs } from 'antd-schema-form/es/types';
import 'antd-schema-form/style/antd-schema-form.css';
import type { FormInstance } from 'antd';
import type { Store } from 'rc-field-form/es/interface';
import './index.global.sass';
import checkboxDesc from './components/checkboxDesc';
import pocket48LogDir from './components/pocket48LogDir';
import xiaohongshuCacheFile from './components/xiaohongshuCacheFile';
import IMLogin from './components/IMLogin/IMLogin';
import randomId from './components/randomId';
import userInfoSearch from './components/userInfoSearch/userInfoSearch';
import { getOptionItem, saveFormData } from '../reducers/options';
import { formatToV2Config, formatOptionType } from '../../../QQ/function/formatConfig';
import * as editV2SchemaJson from './editv2.schema.json' assert { type: 'json' };
import type { OptionsItem, OptionsItemValueV2 } from '../../../commonTypes';

const customComponent: CustomComponentObject = {
  checkboxDesc,
  pocket48LogDir,
  xiaohongshuCacheFile,
  IMLogin,
  randomId,
  userInfoSearch
};

const customTableRender: CustomTableRenderObject = {
  // 自定义组件
  douyinUserId({ value, record, index, root, form }: CustomTableRenderFuncArgs): ReactElement {
    return <div className="w-[200px]">{ value }</div>;
  }
};

/* 配置表单V2 */
function EditV2(props: {}): ReactElement {
  const dispatch: Dispatch = useDispatch();
  const params: Params = useParams();
  const navigate: NavigateFunction = useNavigate();
  const formRef: RefObject<FormInstance | null> = useRef(null);

  // 数据回填
  async function getData(): Promise<void> {
    if (params?.id) {
      const { result }: { result: OptionsItem } = await dispatch(getOptionItem({
        query: params.id
      }));
      const value: OptionsItemValueV2 = formatOptionType(formatToV2Config(result.value));

      formRef.current?.setFieldsValue?.(getObjectFromValue({ $root: value }));
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
  function handleGoBackClick(event: MouseEvent): void {
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
        customTableRender={ customTableRender }
        okText="保存"
        cancelText="返回"
        onOk={ handleSaveClick }
        onCancel={ handleGoBackClick }
      />
    </div>
  );
}

export default EditV2;