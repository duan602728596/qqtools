/* 成员微博监听配置 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Card, Checkbox, Form, Input } from 'antd';
import style from '../style.sass';
import * as ShuoMing from '../utils/shuoming';

class WeiboConfiguration extends Component {
  static propTypes = {
    form: PropTypes.object,
    detail: PropTypes.object
  };

  render() {
    const { detail, form } = this.props;
    const { getFieldDecorator } = form;
    const colsArea2 = { labelCol: { span: 6 }, wrapperCol: { span: 18 } };
    const isWeiboListener = detail?.basic?.isWeiboListener; // 微博监听
    const isWeiboAtAll = detail?.basic?.isWeiboAtAll; // @所有成员

    return (
      <Card className={ style.mb10 } title="成员微博监听配置">
        <ShuoMing.WeiBo />
        <Form.Item label="开启成员微博监听" { ...colsArea2 }>
          {
            getFieldDecorator('isWeiboListener', {
              initialValue: isWeiboListener
            })(<Checkbox defaultChecked={ isWeiboListener } />)
          }
        </Form.Item>
        <Form.Item label="@所有成员" { ...colsArea2 }>
          {
            getFieldDecorator('isWeiboAtAll', {
              initialValue: isWeiboAtAll
            })(<Checkbox defaultChecked={ isWeiboAtAll } />)
          }
        </Form.Item>
        <Form.Item label="微博lfid" { ...colsArea2 }>
          {
            getFieldDecorator('lfid', {
              initialValue: detail ? detail.basic.lfid : ''
            })(<Input />)
          }
        </Form.Item>
      </Card>
    );
  }
}

export default WeiboConfiguration;