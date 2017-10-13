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
  state: {
    customProfiles: Object[]
  };
  constructor(props: Object): void{
    super(props);

    this.state = {
      customProfiles: [] // 自定义配置
    };
  }
  render(): Object{
    const { getFieldDecorator } = this.props.form;
    return (
      <Form className={ formStyle.form } layout="inline">
        <Affix className={ formStyle.affix }>
          <Button className={ formStyle.saveBtn } type="primary" htmlType="submit" size="default" icon="hdd">保存</Button>
          <br />
          <Link to="/Option">
            <Button type="danger" size="default" icon="poweroff">返回</Button>
          </Link>
        </Affix>
        <div>
          {/* 基础配置 */}
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
          <Form.Item label="监视群名称">
            {
              getFieldDecorator('groupName', {
                rules: [
                  {
                    message: '必须输入要监视的群名称',
                    required: true,
                    whitespace: true
                  }
                ]
              })(
                <Input placeholder="输入群名称" />
              )
            }
          </Form.Item>
          <hr className={ formStyle.line } />
        </div>
        {/* 微打赏配置 */}
        <h4 className={ formStyle.title }>微打赏配置：</h4>
        <div>
          <Form.Item className={ formStyle.mb15 } label="开启微打赏功能">
            {
              getFieldDecorator('isWds')(
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
        {/* 口袋48直播监听配置 */}
        <h4 className={ formStyle.title }>直播监听：</h4>
        <div>
          <Form.Item className={ formStyle.mb15 } label="开启口袋48直播监听功能">
            {
              getFieldDecorator('is48LiveListener')(
                <Checkbox.Group options={[
                  {
                    label: '',
                    value: 'is48LiveListener'
                  }
                ]} />
              )
            }
          </Form.Item>
          <br />
          <Form.Item label="监听成员">
            <div className={ commonStyle.clearfix }>
              {
                getFieldDecorator('48LiveListenerMembers')(
                  <Input.TextArea className={ formStyle.template } rows={ 3 } />
                )
              }
              <p className={ formStyle.shuoming }>多个成员名字之间用","（半角逗号）分隔。</p>
            </div>
          </Form.Item>
        </div>
        {/* 心知天气 */}
        <h4 className={ formStyle.title }>心知天气：</h4>
        <div>
          <p className={ formStyle.mb15 }>该接口用来查询天气情况，目前官方的个人查询限制为400次/时。</p>
          <p className={ formStyle.mb15 }>
            请自行到心知天气的官方网站&nbsp;
            <b>https://www.seniverse.com/</b>
            &nbsp;注册账号并填写appKey。
          </p>
          <Form.Item className={ formStyle.mb15 } label="开启心知天气的查询天气功能">
            {
              getFieldDecorator('isXinZhiTianQi')(
                <Checkbox.Group options={[
                  {
                    label: '',
                    value: 'isXinZhiTianQi'
                  }
                ]} />
              )
            }
          </Form.Item>
          <Form.Item className={ formStyle.mb15 } label="心知天气appKey">
            {
              getFieldDecorator('xinZhiTianQiAppKey')(
                <Input placeholder="请输入您的appKey" />
              )
            }
          </Form.Item>
          <br />
          <Form.Item label="天气情况模板">
            <div className={ commonStyle.clearfix }>
              {
                getFieldDecorator('xinZhiTianQiTemplate', {
                  initialValue: `【{{ name }}】\n天气：{{ text }}\n温度：{{ temperature }}℃`
                })(
                  <Input.TextArea className={ formStyle.template } rows={ 5 } />
                )
              }
              <p className={ formStyle.shuoming }>
                <b>模板关键字：</b><br />
                name：查询城市，<br />
                text：天气现象文字，<br />
                temperature：温度<br />
              </p>
            </div>
          </Form.Item>
        </div>
        <hr className={ formStyle.line } />
        {/* 自定义配置 */}
        <h4 className={ formStyle.title }>自定义配置：</h4>
        <dl className={ `${ formStyle.customProfiles } ${ commonStyle.clearfix }` }>
          <dt className={ formStyle.customProfilesForm }>
            <label className={ formStyle.customProfilesLB }>命令：</label>
            <Input className={ formStyle.customProfilesLB } />
            <label className={ formStyle.customProfilesLB }>返回消息：</label>
            <Input.TextArea className={ formStyle.customProfilesLB } rows={ 8 } />
            <Button type="primary" icon="plus">添加</Button>
          </dt>
          <dd className={ formStyle.customProfilesList }></dd>
        </dl>
      </Form>
    );
  }
}

export default Add;