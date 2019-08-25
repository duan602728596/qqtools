/* 群内定时消息推送 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Card, Checkbox, Form, Input } from 'antd';
import style from '../style.sass';
import * as ShuoMing from '../utils/shuoming';

class TimingMessagePush extends Component {
  static propTypes = {
    form: PropTypes.object,
    detail: PropTypes.object
  };

  render() {
    const { detail, form } = this.props;
    const { getFieldDecorator } = form;
    const colsArea2 = { labelCol: { span: 6 }, wrapperCol: { span: 18 } };
    const isTimingMessagePush = detail?.basic?.isTimingMessagePush; // 定时推送

    return (
      <Card className={ style.mb10 } title="群内定时消息推送">
        <Form.Item label="开启群内定时消息推送功能" { ...colsArea2 }>
          {
            getFieldDecorator('isTimingMessagePush', {
              initialValue: isTimingMessagePush,
              valuePropName: 'checked'
            })(<Checkbox />)
          }
        </Form.Item>
        <Form.Item label="规则配置" { ...colsArea2 }>
          {
            getFieldDecorator('timingMessagePushFormat', {
              initialValue: detail ? detail.basic.timingMessagePushFormat : ''
            })(<Input />)
          }
          <ShuoMing.TimingMessagePushFormat />
        </Form.Item>
        <Form.Item label="推送消息" { ...colsArea2 }>
          <div className="clearfix">
            {
              getFieldDecorator('timingMessagePushText', {
                initialValue: detail ? detail.basic.timingMessagePushText : ''
              })(<Input.TextArea className={ style.template } rows={ 10 } />)
            }
          </div>
        </Form.Item>
      </Card>
    );
  }
}

export default TimingMessagePush;