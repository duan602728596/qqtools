// @flow
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import { createSelector, createStructuredSelector } from 'reselect';
import { Form, Input, Checkbox, Affix, Button, Icon } from 'antd';
import formStyle from '../form.sass';
import commonStyle from '../../../common.sass';

@withRouter
@Form.create()
class Add extends Component{
  render(): Object{
    const { getFieldDecorator } = this.props.form;
    return (
      <Form className={ formStyle.form } layout="inline">
        <Affix className={ formStyle.affix }>
          <Button className={ formStyle.saveBtn } type="primary" htmlType="submit" size="default">
            <Icon type="hdd" />
            <span>保存</span>
          </Button>
          <br />
          <Link to="/Option">
            <Button type="danger" size="default">
              <Icon type="poweroff" />
              <span>返回</span>
            </Button>
          </Link>
        </Affix>
        <div>
          <Form.Item label="配置名称">
            {
              getFieldDecorator('name', {
                rules: [
                  {
                    message: '必须输入配置名称',
                    required: true,
                    whitespace: true
                  }
                ]
              })(
                <Input placeholder="输入配置名称" />
              )
            }
          </Form.Item>
          <h4 className={ formStyle.title }>微打赏配置：</h4>
          <div>
            <Form.Item className={ formStyle.mb15 } label="是否开启微打赏功能">
              {
                getFieldDecorator('isWds', {
                  initialValue: ['isWds']
                })(
                  <Checkbox.Group options={[
                    {
                      label: '',
                      value: 'isWds'
                    }
                  ]} />
                )
              }
            </Form.Item>
            <Form.Item className={ formStyle.mb15 } label="微打赏ID">
              {
                getFieldDecorator('wdsId')(
                  <Input />
                )
              }
            </Form.Item>
            <br />
            <Form.Item label="微打赏模板">
              <div className={ commonStyle.clearfix }>
                {
                  getFieldDecorator('wdsTemplate', {
                    initialValue: `@{{ id }} 刚刚在【{{ wdsname }}】打赏了{{ money }}元，排名提高了{{ rankingchage }}名，当前排名{{ ranking }}。` +
                                  `感谢这位聚聚！\n已筹集资金：{{ amount }}\n微打赏地址：https://wds.modian.com/show_weidashang_pro/{{ wdsid }}#1`
                  })(
                    <Input.TextArea className={ formStyle.template } rows={ 8 } />
                  )
                }
                <p className={ formStyle.shuoming }>
                  <b>模板关键字：</b><br />
                  id：打赏人的ID，<br />
                  money：打赏金额，<br />
                  amount：总金额，<br />
                  ranking：当前排名，<br />
                  rankingchage：排名变化（提高），<br />
                  wdsname：微打赏的名称，<br />
                  wdsid：微打赏的ID<br />
                </p>
              </div>
            </Form.Item>
          </div>
        </div>
      </Form>
    );
  }
}

export default Add;