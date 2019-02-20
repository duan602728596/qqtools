/* 摩点项目配置 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Card, Checkbox, Form, Input } from 'antd';
import style from '../style.sass';
import * as initialValues from '../utils/initialValues';
import * as ShuoMing from '../utils/shuoming';

class ModianConfiguration extends Component {
  static propTypes: Object = {
    form: PropTypes.object,
    detail: PropTypes.object
  };

  render(): React.Node {
    const { detail, form }: { detail: ?Object; form: Object } = this.props;
    const { getFieldDecorator }: { getFieldDecorator: Function } = form;
    const colsArea1: Object = { labelCol: { span: 4 }, wrapperCol: { span: 20 } };

    const isModian: boolean = detail?.basic?.isModian; // 开启摩点
    const isModianLeaderboard: boolean = detail?.basic?.isModianLeaderboard; // 群内摩点排行榜查询

    return (
      <Card className={ style.mb10 } title="摩点项目配置">
        <Form.Item label="开启摩点相关功能" { ...colsArea1 }>
          {
            getFieldDecorator('isModian', {
              initialValue: isModian
            })(<Checkbox defaultChecked={ isModian } />)
          }
        </Form.Item>
        <Form.Item label="开启排行榜查询" { ...colsArea1 }>
          {
            getFieldDecorator('isModianLeaderboard', {
              initialValue: isModianLeaderboard
            })(<Checkbox defaultChecked={ isModianLeaderboard } />)
          }
          <ShuoMing.IsModianLeaderboard />
        </Form.Item>
        <Form.Item label="摩点ID" { ...colsArea1 }>
          {
            getFieldDecorator('modianId', {
              initialValue: detail ? detail.basic.modianId : ''
            })(<Input />)
          }
        </Form.Item>
        <Form.Item label="摩点命令" { ...colsArea1 }>
          {
            getFieldDecorator('modianUrlTemplate', {
              initialValue: detail ? detail.basic.modianUrlTemplate : initialValues.modianUrlTemplate
            })(<Input.TextArea className={ style.template } rows={ 5 } />)
          }
          <ShuoMing.ModianUrlTemplate />
        </Form.Item>
        <Form.Item label="集资提示" { ...colsArea1 }>
          {
            getFieldDecorator('modianTemplate', {
              initialValue: detail ? detail.basic.modianTemplate : initialValues.modianTemplate
            })(<Input.TextArea className={ style.template } rows={ 10 } />)
          }
          <ShuoMing.ModianTemplate />
        </Form.Item>
      </Card>
    );
  }
}

export default ModianConfiguration;