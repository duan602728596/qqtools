import * as React from 'react';
import { useEffect, ReactElement, MouseEvent } from 'react';
import type { Dispatch } from 'redux';
import { useDispatch } from 'react-redux';
import { Link, useParams, useNavigate } from 'react-router-dom';
import type { Params, NavigateFunction } from 'react-router';
import { Form, Button, Space, Input, InputNumber, Divider, Switch } from 'antd';
import type { FormInstance } from 'antd/es/form';
import type { Store } from 'rc-field-form/es/interface';
import { random, transform } from 'lodash';
import style from './index.sass';
import { saveFormData, getOptionItem } from '../models/models';
import CustomCmd from './CustomCmd';
import type { OptionsItem } from '../../../types';

/* 配置表单 */
function Edit(props: {}): ReactElement {
  const dispatch: Dispatch = useDispatch();
  const params: Params = useParams();
  const navigate: NavigateFunction = useNavigate();
  const [form]: [FormInstance] = Form.useForm();

  // 数据回填
  async function getData(): Promise<void> {
    const { result }: { result: OptionsItem } = await dispatch(getOptionItem({
      query: params.id
    }));

    form.setFieldsValue(result.value);
  }

  // 保存
  async function handleSaveClick(event: MouseEvent): Promise<void> {
    let formValue: Store | null = null;

    try {
      formValue = await form.validateFields();
    } catch (err) {
      console.error(err);
    }

    if (!formValue) return;

    // 获取id或者随机id
    const id: string = params?.id ?? String(random(1, 10000000));
    const name: string = formValue.optionName;

    // 剔除undefined
    const formatFormValue: Store = transform(formValue, function(result: Store, value: any, key: string): void {
      if (value !== undefined) {
        result[key] = value;
      }
    }, {});

    await dispatch(saveFormData({
      data: { id, name, value: formatFormValue }
    }));

    navigate('/Options');
  }

  useEffect(function() {
    if (params?.id) {
      getData();
    }
  }, [params?.id]);

  return (
    <Form className={ style.form } form={ form } labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
      {/* 基础表单配置 */}
      <Form.Item name="optionName"
        label="配置名称"
        rules={ [{ required: true, message: '必须填写配置名称', whitespace: true }] }
      >
        <Input />
      </Form.Item>
      <Form.Item name="qqNumber" label="QQ号" rules={ [{ required: true, message: '必须填写QQ号' }] }>
        <InputNumber className={ style.inputNumber } />
      </Form.Item>
      <Form.Item name="groupNumber" label="群号" rules={ [{ required: true, message: '必须填写群号' }] }>
        <InputNumber className={ style.inputNumber } />
      </Form.Item>
      <Form.Item name="socketPort" label="端口号" rules={ [{ required: true, message: '必须填写端口号' }] }>
        <InputNumber className={ style.inputNumber } />
      </Form.Item>
      <Form.Item name="authKey"
        label="authKey"
        rules={ [{ required: true, message: '必须填写authKey', whitespace: true }] }
      >
        <Input />
      </Form.Item>
      {/* 口袋48房间监听配置 */}
      <Divider>口袋监听配置</Divider>
      <Form.Item name="pocket48RoomListener" label="开启监听" valuePropName="checked">
        <Switch />
      </Form.Item>
      <Form.Item name="pocket48RoomId" label="房间ID">
        <Input />
      </Form.Item>
      <Form.Item name="pocket48Account" label="账号account">
        <Input />
      </Form.Item>
      {/* 微博监听配置 */}
      <Divider>微博监听配置</Divider>
      <Form.Item name="weiboListener" label="开启监听" valuePropName="checked">
        <Switch />
      </Form.Item>
      <Form.Item name="weiboUid" label="微博uid">
        <Input />
      </Form.Item>
      {/* 自定义命令 */}
      <Divider>自定义命令</Divider>
      <Form.Item name="customCmd" labelCol={{ span: 0 }} wrapperCol={{ span: 24 }}>
        <CustomCmd />
      </Form.Item>
      <Space>
        <Button type="primary" onClick={ handleSaveClick }>保存</Button>
        <Link to="/Options">
          <Button type="primary" danger={ true }>返回</Button>
        </Link>
      </Space>
    </Form>
  );
}

export default Edit;