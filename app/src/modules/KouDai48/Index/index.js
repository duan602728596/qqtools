/* 口袋48登录和房间抓取 */
import React, { Component, Fragment } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { createSelector, createStructuredSelector } from 'reselect';
import { Affix, Table, Button, Card, message, Form, Row, Col, Input, Popconfirm } from 'antd';
import publicStyle from '../../publicMethod/public.sass';
import style from './style.sass';
import { loginInformation, getLoginInformation, putLoginInformation, cursorMemberInformation, clearLoginInformation, clearMemberInformation } from '../store/reducer';
import LoginInformation from './LoginInformation';
import MemberInformation from './MemberInformation';
import { login } from '../../../components/kd48listerer/roomListener';

// 格式化数组
export function format(rawArray: Array, from: number, to: number): Array{
  if(rawArray.length === 0){
    return [];
  }

  if(from === to){
    return [
      {
        memberId: rawArray[from]
      }
    ];
  }

  const middle: number = Math.floor((to - from) / 2) + from;
  const left: Array = format(rawArray, from, middle);
  const right: Array = format(rawArray, middle + 1, to);

  return left.concat(right);
}

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
    putLoginInformation,
    cursorMemberInformation,
    clearLoginInformation,
    clearMemberInformation
  }, dispatch)
});

@Form.create()
@connect(state, dispatch)
class KouDai48 extends Component{
  state: {
    searchString: string,
    searchResult: Array
  };
  constructor(): void{
    super(...arguments);

    this.state = {
      searchString: '',   // 搜索关键字
      searchResult: []    // 搜索结果
    };
  }
  UNSAFE_componentWillMount(): void{
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
        render: (text: string, item: Object, index: number): Object => <MemberInformation item={ item } />
      }
    ];
    return columns;
  }
  // 登录
  onSubmit(event: Event): void{
    event.preventDefault();
    this.props.form.validateFields(async(err: any, value: Object): Promise<void>=>{
      if(!err){
        try{
          const data: Object = await login(value.account, value.password);
          const content: Object = data.content;
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
  // 搜索
  onInputChange(event: Event): void{
    this.setState({
      searchString: event.target.value
    });
  }
  async onSearchInformation(event: Event): Promise<void>{
    const data: Object = await this.props.action.cursorMemberInformation({
      query: {
        indexName: 'memberName',    // 索引
        range: this.state.searchString
      }
    });
    this.setState({
      searchResult: data.result
    });
  }
  // 退出并清除缓存
  async onExitAndClear(event: Event): Promise<void>{
    await this.props.action.clearLoginInformation();
    await this.props.action.clearMemberInformation();
    this.props.action.loginInformation({
      data: null
    });
  }
  render(): Object{
    const { getFieldDecorator }: { getFieldDecorator: Function } = this.props.form;
    const loginInformation: ?Object = this.props.loginInformation;

    // 渲染搜索结果
    const resultEle: Array = [];
    this.state.searchResult.map((item: Object, index: number): void=>{
      resultEle.push(
        <div key={ item.memberId } className={ style.searchGroup }>
          <p className={ style.searchText }>memberId:&nbsp;{ item.memberId }</p>
          <p className={ style.searchText }>memberName:&nbsp;{ item.memberName }</p>
          <p className={ style.searchText }>roomId:&nbsp;{ item.roomId }</p>
        </div>
      );
    });

    return (
      <Fragment>
        <Affix key={ 0 } className={ publicStyle.affix }>
          <div className={ `${ publicStyle.toolsBox } clearfix` }>
            <div className={ publicStyle.fr }>
              <Popconfirm title="确定退出登录并清除缓存吗？" onConfirm={ this.onExitAndClear.bind(this) }>
                <Button icon="warning">退出登录并清除缓存</Button>
              </Popconfirm>
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
              <Card className={ style.mb10 } title="ID搜索">
                <div>
                  <label htmlFor="koudai48-search">在数据库中搜索小偶像的相关信息，请输入小偶像的名字：</label>
                  <Input className={ style.searchId }
                    id="koudai48-search"
                    value={ this.state.searchString }
                    onChange={ this.onInputChange.bind(this) }
                    onPressEnter={ this.onSearchInformation.bind(this) }
                  />
                  <Button className={ publicStyle.ml10 } type="primary" onClick={ this.onSearchInformation.bind(this) }>搜索</Button>
                  { resultEle }
                </div>
              </Card>
              <Table columns={ this.columns() }
                size="middle"
                rowKey={ (item: Object): number => item.memberId  }
                bordered={ true }
                dataSource={ loginInformation ? format(loginInformation.value.friends, 0, loginInformation.value.friends.length - 1) : [] }
                pagination={{
                  defaultPageSize: 10,
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