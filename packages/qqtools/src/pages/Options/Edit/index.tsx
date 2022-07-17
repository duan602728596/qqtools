import { randomUUID } from 'node:crypto';
import type { OpenDialogReturnValue } from 'electron';
import { dialog } from '@electron/remote';
import { useEffect, type ReactElement, type MouseEvent } from 'react';
import { useDispatch } from 'react-redux';
import type { Dispatch } from '@reduxjs/toolkit';
import { Link, useParams, useNavigate, type Params, type NavigateFunction } from 'react-router-dom';
import { Form, Button, Space, Input, InputNumber, Divider, Switch, Checkbox, Select } from 'antd';
import type { FormInstance } from 'antd/es/form';
import type { Store } from 'rc-field-form/es/interface';
import type { CheckboxOptionType } from 'antd/es/checkbox';
import { saveFormData, getOptionItem } from '../reducers/reducers';
import CustomCmd from './CustomCmd';
import LoginModal from './LoginModal';
import type { OptionsItem } from '../../../types';

const pocket48ShieldMsgTypeOptions: Array<CheckboxOptionType> = [
  { value: 'TEXT', label: '普通信息' },
  { value: 'REPLY', label: '回复信息' },
  { value: 'IMAGE', label: '图片' },
  { value: 'AUDIO', label: '语音' },
  { value: 'VIDEO', label: '视频' },
  { value: 'LIVEPUSH', label: '直播' },
  { value: 'FLIPCARD', label: '翻牌' },
  { value: 'FLIPCARD_AUDIO', label: '语音翻牌' },
  { value: 'FLIPCARD_VIDEO', label: '视频翻牌' },
  { value: 'EXPRESSIMAGE', label: '2021表情图片' },
  { value: 'EXPRESS', label: '表情' },
  { value: 'GIFTREPLY', label: '礼物回复信息' },
  { value: 'PRESENT_TEXT', label: '投票' },
  { value: 'UNKNOWN', label: '未知类型' },
  { value: 'ERROR', label: '错误信息' }
];

/* 表单的初始化值 */
const initialStates: Store = {
  groupWelcomeSend: '<%= qqtools:At %>欢迎入群。'
};

/* 配置表单 */
function Edit(props: {}): ReactElement {
  const dispatch: Dispatch = useDispatch();
  const params: Params = useParams();
  const navigate: NavigateFunction = useNavigate();
  const [form]: [FormInstance] = Form.useForm();

  // 数据回填
  async function getData(): Promise<void> {
    if (params?.id) {
      const { result }: { result: OptionsItem } = await dispatch(getOptionItem({
        query: params.id
      }));

      form.setFieldsValue(result.value);
    }
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

  // 选择日志保存位置
  async function handleLogSaveDirClick(event: MouseEvent<HTMLButtonElement>): Promise<void> {
    const result: OpenDialogReturnValue = await dialog.showOpenDialog({
      properties: ['openDirectory']
    });

    if (result.canceled || !result.filePaths || result.filePaths.length === 0) return;

    form.setFieldsValue({
      pocket48LogDir: result.filePaths[0]
    });
  }

  // 清除保存位置
  function handleLogSaveDirResetClick(event: MouseEvent<HTMLButtonElement>): void {
    form.resetFields(['pocket48LogDir']);
  }

  useEffect(function() {
    getData();
  }, [params?.id]);

  return (
    <Form className="p-[16px]"
      form={ form }
      initialValues={ initialStates }
      labelCol={{ span: 5 }}
      wrapperCol={{ span: 19 }}
    >
      {/* 基础表单配置 */}
      <Form.Item name="optionName"
        label="配置名称"
        rules={ [{ required: true, message: '必须填写配置名称', whitespace: true }] }
      >
        <Input />
      </Form.Item>
      <Form.Item name="optionType" label="配置类型">
        <Select allowClear={ true }>
          <Select.Option value="0">mirai</Select.Option>
          <Select.Option value="1">oicq</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item name="qqNumber" label="QQ号" rules={ [{ required: true, message: '必须填写QQ号' }] }>
        <InputNumber className="w-full" />
      </Form.Item>
      <Form.Item name="groupNumber" label="群号" rules={ [{ required: true, message: '必须填写群号' }] }>
        <Input placeholder={ '支持配置多个群，以 "," 分隔' } />
      </Form.Item>
      <Form.Item name="socketHost" label="host">
        <Input placeholder="配置socket的host，默认为localhost，一般不需要填写" />
      </Form.Item>
      <Form.Item name="socketPort" label="端口号" rules={ [{ required: true, message: '必须填写端口号' }] }>
        <InputNumber className="w-full" />
      </Form.Item>
      <Form.Item label="authKey"
        required={ true }
        shouldUpdate={ ((pv: Store, nv: Store): boolean => pv.optionType !== nv.optionType) }
      >
        {
          (formInstance: FormInstance): ReactElement => {
            const optionType: string | undefined = formInstance.getFieldValue('optionType');
            const isMirai: boolean = optionType === undefined || optionType === null || optionType === '0';

            return (
              <Form.Item name="authKey"
                rules={ isMirai ? [{ required: true, message: '必须填写authKey' }] : undefined }
                noStyle={ true }
              >
                <Input placeholder="mirai配置类型时需要填写" disabled={ !isMirai } />
              </Form.Item>
            );
          }
        }
      </Form.Item>

      {/* 口袋48房间监听配置 */}
      <Divider>口袋监听配置</Divider>
      <Form.Item name="pocket48RoomListener" label="开启监听" valuePropName="checked">
        <Switch />
      </Form.Item>
      <Form.Item name="pocket48RoomId" label="房间ID">
        <Input />
      </Form.Item>
      <Form.Item name="pocket48IsAnonymous" label="游客模式" valuePropName="checked">
        <Switch />
      </Form.Item>
      <Form.Item name="pocket48Account" label="IM的account">
        <Input />
      </Form.Item>
      <Form.Item label="IM的token">
        <Form.Item name="pocket48Token" noStyle={ true }>
          <Input />
        </Form.Item>
        <LoginModal form={ form } />
      </Form.Item>
      <Form.Item name="pocket48LiveAtAll" label="@全体成员" valuePropName="checked">
        <Checkbox>直播时@全体成员（需要有管理员权限）</Checkbox>
      </Form.Item>
      <Form.Item name="pocket48ShieldMsgType" label="屏蔽信息类型">
        <Checkbox.Group options={ pocket48ShieldMsgTypeOptions } />
      </Form.Item>
      <Form.Item name="pocket48RoomEntryListener" label="口袋房间进出监听" valuePropName="checked">
        <Checkbox>口袋房间进出监听（需要先导入房间信息）</Checkbox>
      </Form.Item>
      <Form.Item name="pocket48OwnerOnlineListener" label="成员上线下线监听" valuePropName="checked">
        <Checkbox>成员上线下线监听（需要先导入房间信息）</Checkbox>
      </Form.Item>
      <Form.Item name="pocket48MemberInfo" label="发送时带上房间信息" valuePropName="checked">
        <Checkbox>发送时带上房间信息（需要先导入房间信息）</Checkbox>
      </Form.Item>
      <Form.Item name="pocket48LogSave" label="房间信息日志" valuePropName="checked">
        <Checkbox>口袋消息会同步记录到日志</Checkbox>
      </Form.Item>
      <Form.Item label="日志保存位置">
        <Space>
          <Form.Item name="pocket48LogDir" noStyle={ true }>
            <Input readOnly={ true } />
          </Form.Item>
          <Button onClick={ handleLogSaveDirClick }>选择日志保存位置</Button>
          <Button type="primary" danger={ true } onClick={ handleLogSaveDirResetClick }>清除</Button>
        </Space>
      </Form.Item>

      {/* 微博监听配置 */}
      <Divider>微博监听配置</Divider>
      <Form.Item name="weiboListener" label="开启监听" valuePropName="checked">
        <Switch />
      </Form.Item>
      <Form.Item name="weiboUid" label="微博uid">
        <Input />
      </Form.Item>
      <Form.Item name="weiboAtAll" label="@全体成员" valuePropName="checked">
        <Checkbox>发微博时@全体成员（需要有管理员权限）</Checkbox>
      </Form.Item>
      <Form.Item name="weiboSuperTopicListener" label="开启微博超级话题监听" valuePropName="checked">
        <Switch />
      </Form.Item>
      <Form.Item name="weiboSuperTopicLfid" label="微博超话lfid">
        <Input />
      </Form.Item>

      {/* B站直播监听 */}
      <Divider>B站直播监听</Divider>
      <Form.Item name="bilibiliLive" label="开启监听" valuePropName="checked">
        <Switch />
      </Form.Item>
      <Form.Item name="bilibiliLiveId" label="直播间ID">
        <Input />
      </Form.Item>
      <Form.Item name="bilibiliAtAll" label="@全体成员" valuePropName="checked">
        <Checkbox>直播时@全体成员（需要有管理员权限）</Checkbox>
      </Form.Item>

      {/* 群欢迎功能 */}
      <Divider>群欢迎功能</Divider>
      <Form.Item name="groupWelcome" label="开启功能" valuePropName="checked">
        <Switch />
      </Form.Item>
      <Form.Item name="groupWelcomeSend" label="发送信息">
        <Input.TextArea rows={ 5 } />
      </Form.Item>

      {/* 定时任务 */}
      <Divider>定时任务</Divider>
      <Form.Item name="cronJob" label="开启任务" valuePropName="checked">
        <Switch />
      </Form.Item>
      <Form.Item name="cronTime" label="执行时间">
        <Input />
      </Form.Item>
      <Form.Item name="cronSendData" label="发送信息">
        <Input.TextArea rows={ 5 } />
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