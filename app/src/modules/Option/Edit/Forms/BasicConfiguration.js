/* 基础配置 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Card, Form, Input } from 'antd';
import style from '../style.sass';

class BasicConfiguration extends Component{
  static propTypes: Object = {
    form: PropTypes.object,
    detail: PropTypes.object
  };

  render(): React.Element{
    const { detail, form }: { detail: ?Object, form: Object } = this.props;
    const { getFieldDecorator }: { getFieldDecorator: Function } = form;
    const colsArea1: Object = { labelCol: { span: 4 }, wrapperCol: { span: 20 } };

    return (
      <Card className={ style.mb10 } title="基础配置">
        {/* 基础配置 */}
        <Form.Item label="配置名称" { ...colsArea1 }>
          {
            getFieldDecorator('name', {
              initialValue: detail ? detail.name : '',
              rules: [
                {
                  message: '必须输入配置名称',
                  required: true,
                  whitespace: true
                }
              ]
            })(<Input placeholder="输入配置名称" readOnly={ detail } />)
          }
        </Form.Item>
        <Form.Item label="QQ号" { ...colsArea1 }>
          {
            getFieldDecorator('qqNumber', {
              initialValue: detail ? detail.qqNumber : '',
              rules: [
                {
                  message: '必须输入QQ号',
                  required: true,
                  whitespace: true
                }
              ]
            })(<Input placeholder="输入配置名称" />)
          }
        </Form.Item>
        <Form.Item label="Socket端口号" { ...colsArea1 }>
          {
            getFieldDecorator('socketPort', {
              initialValue: detail ? detail.socketPort : '6700',
              rules: [
                {
                  message: '必须输入Socket端口号',
                  required: true,
                  whitespace: true
                }
              ]
            })(<Input placeholder="输入配置名称" />)
          }
        </Form.Item>
        <Form.Item label="监听群号" { ...colsArea1 }>
          {
            getFieldDecorator('groupNumber', {
              initialValue: detail ? detail.groupNumber : '',
              rules: [
                {
                  message: '必须输入要监听的群号',
                  required: true,
                  whitespace: true
                }
              ]
            })(<Input placeholder="输入群号" />)
          }
        </Form.Item>
      </Card>
    );
  }
}

export default BasicConfiguration;