/* 口袋48直播监听配置 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Card, Checkbox, Form, Input } from 'antd';
import style from '../style.sass';
import * as ShuoMing from '../utils/shuoming';

class Koudai48LiveListener extends Component {
  static propTypes: Object = {
    form: PropTypes.object,
    detail: PropTypes.object
  };

  render(): React.Element {
    const { detail, form }: { detail: ?Object, form: Object } = this.props;
    const { getFieldDecorator }: { getFieldDecorator: Function } = form;
    const colsArea2: Object = { labelCol: { span: 6 }, wrapperCol: { span: 18 } };

    const is48LiveListener: boolean = detail?.basic?.is48LiveListener; // 口袋48直播
    const is48LiveAtAll: boolean = detail?.basic?.is48LiveAtAll; // @所有成员
    const isListenerAll: boolean = detail?.basic?.isListenerAll; // 监听所有成员

    return (
      <Card className={ style.mb10 } title="口袋48直播监听">
        <Form.Item label="开启口袋48直播监听功能" { ...colsArea2 }>
          {
            getFieldDecorator('is48LiveListener', {
              initialValue: is48LiveListener
            })(<Checkbox defaultChecked={ is48LiveListener } />)
          }
        </Form.Item>
        <Form.Item label="监听所有成员" { ...colsArea2 }>
          {
            getFieldDecorator('isListenerAll', {
              initialValue: isListenerAll
            })(<Checkbox defaultChecked={ isListenerAll } />)
          }
        </Form.Item>
        <Form.Item label="@所有成员" { ...colsArea2 }>
          {
            getFieldDecorator('is48LiveAtAll', {
              initialValue: is48LiveAtAll
            })(<Checkbox defaultChecked={ is48LiveAtAll } />)
          }
        </Form.Item>
        <Form.Item label="监听成员" { ...colsArea2 }>
          {
            getFieldDecorator('kd48LiveListenerMembers', {
              initialValue: detail ? detail.basic.kd48LiveListenerMembers : ''
            })(<Input.TextArea className={ style.template } rows={ 5 } />)
          }
          <ShuoMing.Kd48LiveListenerMembers />
        </Form.Item>
      </Card>
    );
  }
}

export default Koudai48LiveListener;