/* 成员绿洲监听配置 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Card, Checkbox, Form, Input } from 'antd';
import style from '../style.sass';
import * as ShuoMing from '../utils/shuoming';

class LvzhouConfiguration extends Component {
  static propTypes = {
    form: PropTypes.object,
    detail: PropTypes.object
  };

  render() {
    const { detail, form } = this.props;
    const { getFieldDecorator } = form;
    const colsArea2 = { labelCol: { span: 6 }, wrapperCol: { span: 18 } };
    const isLvzhouListener = detail?.basic?.isLvzhouListener;   // 绿洲监听
    const isLvzhouAtAll = detail?.basic?.isLvzhouAtAll;         // @所有成员
    const isLvzhouSendImage = detail?.basic?.isLvzhouSendImage; // 发送图片

    return (
      <Card className={ style.mb10 } title="成员绿洲监听配置">
        <Form.Item label="开启成员绿洲监听" { ...colsArea2 }>
          {
            getFieldDecorator('isLvzhouListener', {
              initialValue: isLvzhouListener,
              valuePropName: 'checked'
            })(<Checkbox />)
          }
        </Form.Item>
        <Form.Item label="@所有成员" { ...colsArea2 }>
          {
            getFieldDecorator('isLvzhouAtAll', {
              initialValue: isLvzhouAtAll,
              valuePropName: 'checked'
            })(<Checkbox />)
          }
          <ShuoMing.AtAllMembers />
        </Form.Item>
        <Form.Item label="Params参数" { ...colsArea2 }>
          {
            getFieldDecorator('lvZhouParams', {
              initialValue: detail ? detail.basic.lvZhouParams : ''
            })(<Input.TextArea placeholder="json格式" rows={ 10 } />)
          }
        </Form.Item>
        <Form.Item label="Headers参数" { ...colsArea2 }>
          {
            getFieldDecorator('lvZhouHeaders', {
              initialValue: detail ? detail.basic.lvZhouHeaders : ''
            })(<Input.TextArea placeholder="json格式" rows={ 10 } />)
          }
        </Form.Item>
        <Form.Item label="发送图片" { ...colsArea2 }>
          {
            getFieldDecorator('isLvzhouSendImage', {
              initialValue: isLvzhouSendImage,
              valuePropName: 'checked'
            })(<Checkbox />)
          }
          <ShuoMing.IsRoomSendImage />
        </Form.Item>
      </Card>
    );
  }
}

export default LvzhouConfiguration;