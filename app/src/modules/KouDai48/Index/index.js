/* 口袋48登录和房间抓取 */
import React, { Component, Fragment } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { createSelector, createStructuredSelector } from 'reselect';
import { Affix, Table, Button, Card, message, Form, Row, Col, Input } from 'antd';
import publicStyle from '../../publicMethod/public.sass';
import style from './style.sass';
import { loginInformation, getLoginInformation, putLoginInformation } from '../store/reducer';
import LoginInformation from './LoginInformation';
import MemberInformation from './MemberInformation';
import { format, login } from './unit';

/* 初始化数据 */
const state: Function = createStructuredSelector({
  loginInformation: createSelector(         // 登录信息
    ($$state: Immutable.Map): ?Immutable.Map => $$state.has('kouDai48') ? $$state.get('kouDai48') : null,
    ($$data: ?Immutable.Map): ?Object => $$data !== null ? $$data.get('loginInformation') : null
  )
});

/* dispatch */
const dispatch: Function = (dispatch: Function): Object=>({
  action: bindActionCreators({
    loginInformation,
    getLoginInformation,
    putLoginInformation
  }, dispatch)
});

@Form.create()
@connect(state, dispatch)
class KouDai48 extends Component{
  componentWillMount(): void{
    this.props.action.getLoginInformation({
      query: 'loginInformation'
    });
  }
  // 表格配置
  columns(): Array{
    const columns: Array = [
      {
        title: 'memberId',
        dataIndex: 'memberId',
        key: 'memberId',
        width: '20%'
      },
      {
        title: 'information',
        key: 'information',
        width: '80%',
        render: (text: string, item: Object, index: number) => <MemberInformation item={ item } />
      }
    ];
    return columns;
  }
  // 登录
  onSubmit(event: Event): void{
    event.preventDefault();
    this.props.form.validateFields(async (err: any, value: Object): void=>{
      if(!err){
        try{
          const data: Object = await login(value.account, value.password);
          const { content }: { content: Object } = data;
          const value2: Object = {
            key: 'loginInformation',
            value: {
              friends: content.friends,   // 关注列表
              token: content.token,       // token
              userInfo: content.userInfo  // 本人信息
            }
          };
          await this.props.action.putLoginInformation({
            data: value2
          });
          this.props.form.resetFields();
          message.success('登陆成功！');
        }catch(err){
          message.error('登陆失败！');
          console.error(err);
        }
      }
    });
  }
  render(): Object{
    const { getFieldDecorator }: { getFieldDecorator: Function } = this.props.form;
    const loginInformation: ?Object = this.props.loginInformation;
    return (
      <Fragment>
        <Affix key={ 0 } className={ publicStyle.affix }>
          <div className={ `${ publicStyle.toolsBox } clearfix` }>
            <div className={ publicStyle.fr }>
              <Link className={ publicStyle.ml10 } to="/">
                <Button type="danger" icon="poweroff">返回</Button>
              </Link>
            </div>
          </div>
        </Affix>
        <div className={ style.box }>
          <Row className={ style.body } gutter={ 10 }>
            <Col span={ 12 }>
              <Card className={ style.mb10 } title="口袋48登录">
                <p className={ style.mb10 }>在使用口袋48的房间监听功能前，必须先登录，获取token，否则无法获取到房间信息。</p>
                <p className={ style.mb10 }>登录一次后，token会储存在本地，不需要重复登录。</p>
                <Form onSubmit={ this.onSubmit.bind(this) }>
                  <Form.Item label="用户名">
                    {
                      getFieldDecorator('account', {
                        rules: [
                          {
                            message: '必须输入用户名',
                            required: true,
                            whitespace: true
                          }
                        ]
                      })(<Input />)
                    }
                  </Form.Item>
                  <Form.Item label="密码">
                    {
                      getFieldDecorator('password', {
                        rules: [
                          {
                            message: '必须输入密码',
                            required: true,
                            whitespace: true
                          }
                        ]
                      })(<Input type="password" />)
                    }
                  </Form.Item>
                  <Button type="primary" htmlType="submit">登录</Button>
                </Form>
              </Card>
              <LoginInformation loginInformation={ loginInformation ? loginInformation.value : null } />
            </Col>
            <Col span={ 12 }>
              <Table columns={ this.columns() }
                size="middle"
                rowKey={ (item: Object): number => item.memberId  }
                bordered={ true }
                dataSource={ loginInformation ? format(loginInformation.value.friends, 0, loginInformation.value.friends.length - 1) : [] }
                pagination={{
                  defaultPageSize: 10 ,
                  showQuickJumper: true
                }}
              />
            </Col>
          </Row>
        </div>
      </Fragment>
    );
  }
}

export default KouDai48;