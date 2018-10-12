/* 欢迎新成员 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Card, Checkbox, Form, Input } from 'antd';
import style from '../style.sass';
import * as initialValues from '../initialValues';
import * as ShuoMing from '../shuoming';

class NewGroupMember extends Component{
  static propTypes: Object = {
    form: PropTypes.object,
    detail: PropTypes.object
  };

  render(): React.Element{
    const { detail, form }: { detail: ?Object, form: Object } = this.props;
    const { getFieldDecorator }: { getFieldDecorator: Function } = form;
    const colsArea2: Object = { labelCol: { span: 6 }, wrapperCol: { span: 18 } };

    const isNewGroupMember: boolean = detail?.basic?.isNewGroupMember; // 新成员欢迎

    return (
      <Card className={ style.mb10 } title="欢迎新成员配置">
        <Form.Item label="开启新成员欢迎功能" { ...colsArea2 }>
          {
            getFieldDecorator('isNewGroupMember', {
              initialValue: isNewGroupMember
            })(<Checkbox defaultChecked={ isNewGroupMember } />)
          }
        </Form.Item>
        <Form.Item label="欢迎词" { ...colsArea2 }>
          <div className="clearfix">
            {
              getFieldDecorator('welcomeNewGroupMember', {
                initialValue: detail ? detail.basic.welcomeNewGroupMember : initialValues.welcomeNewGroupMember
              })(<Input.TextArea className={ style.template } rows={ 5 } />)
            }
            <ShuoMing.WelcomeNewGroupMember />
          </div>
        </Form.Item>
      </Card>
    );
  }
}

export default NewGroupMember;