/* 群内定时消息推送 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Card, Checkbox, Form, Input } from 'antd';
import style from '../style.sass';
import * as ShuoMing from '../shuoming';

class TimingMessagePush extends Component{
  static propTypes: Object = {
    form: PropTypes.object,
    detail: PropTypes.object
  };

  render(): React.Element{
    const { detail, form }: { detail: ?Object, form: Object } = this.props;
    const { getFieldDecorator }: { getFieldDecorator: Function } = form;
    const colsArea2: Object = { labelCol: { span: 6 }, wrapperCol: { span: 18 } };

    const isTimingMessagePush: boolean = detail?.basic?.isTimingMessagePush; // 定时推送

    return (
      <Card className={ style.mb10 } title="群内定时消息推送">
        <Form.Item label="开启群内定时消息推送功能" { ...colsArea2 }>
          {
            getFieldDecorator('isTimingMessagePush', {
              initialValue: isTimingMessagePush
            })(<Checkbox defaultChecked={ isTimingMessagePush } />)
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