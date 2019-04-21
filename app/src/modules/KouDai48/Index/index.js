/* 口袋48登录和房间抓取 */
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { createSelector, createStructuredSelector } from 'reselect';
import { Affix, Table, Button, Card, message, Form, Row, Col, Input, Popconfirm, Modal } from 'antd';
import classNames from 'classnames';
import publicStyle from '../../../components/publicStyle/public.sass';
import style from './style.sass';
import {
  loginInformation, getLoginInformation, putLoginInformation, cursorMemberInformation, clearLoginInformation,
  clearMemberInformation
} from '../store/reducer';
import LoginInformation from './LoginInformation';
import MemberInformation from './MemberInformation';
import { login, getFriendsId, requestRoomPage } from '../../../components/kd48listerer/roomListener';

// 格式化数组
export function format(rawArray, from, to) {
  if (rawArray.length === 0) {
    return [];
  }

  if (from === to) {
    return [
      {
        memberId: rawArray[from]
      }
    ];
  }

  const middle = Math.floor((to - from) / 2) + from;
  const left = format(rawArray, from, middle);
  const right = format(rawArray, middle + 1, to);

  return left.concat(right);
}

/* 初始化数据 */
const state = createStructuredSelector({
  loginInformation: createSelector( // 登录信息
    ($$state) => $$state.has('kouDai48') ? $$state.get('kouDai48') : null,
    ($$data) => $$data !== null ? $$data.get('loginInformation') : null
  )
});

/* dispatch */
const dispatch = (dispatch) => ({
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
class KouDai48 extends Component {
  static propTypes = {
    loginInformation: PropTypes.object,
    action: PropTypes.objectOf(PropTypes.func),
    form: PropTypes.object
  };

  constructor() {
    super(...arguments);

    this.state = {
      searchString: '', // 搜索关键字
      searchResult: [] // 搜索结果
    };
  }

  componentDidMount() {
    this.props.action.getLoginInformation({
      query: 'loginInformation'
    });
  }

  // 表格配置
  columns() {
    const roomPage = this.props?.loginInformation?.value?.roomPage || [];

    return [
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
        render: (value, item, index) => <MemberInformation item={ item } roomPage={ roomPage } />
      }
    ];
  }

  // 登录
  handleSubmit(event) {
    event.preventDefault();

    this.props.form.validateFields(async (err, value) => {
      if (!err) {
        try {
          const data = await login(value.account, value.password);

          if (data.status !== 200) {
            message.warn(data.message);

            return void 0;
          }

          const { content } = data;
          const token = content.token || content.userInfo.token;
          const [friends, roomPage] = await Promise.all([
            getFriendsId(token), // 获取好友id列表
            requestRoomPage(token) // 获取房间留言列表
          ]);
          const value2 = {
            key: 'loginInformation',
            value: {
              friends: friends.content.data, // 关注列表
              token, // token
              userInfo: content.userInfo, // 本人信息
              roomPage: roomPage.content.conversations
            }
          };

          await this.props.action.putLoginInformation({
            data: value2
          });
          this.props.form.resetFields();
          message.success('登陆成功！');
        } catch (err) {
          message.error('登陆失败！');
          console.error(err);
        }
      }
    });
  }

  // 搜索
  handleInputChange(event) {
    this.setState({
      searchString: event.target.value
    });
  }

  // 根据姓名匹配搜索房间
  findRoomIdByMemberId(nickname) {
    const roomPage = this.props?.loginInformation?.value?.roomPage || [];
    const ownerItem = [];

    for (const item of roomPage) {
      if (item.ownerName.includes(nickname)) {
        ownerItem.push(item);
      }
    }

    return ownerItem;
  }

  // 搜索事件
  handleSearchInformationClick(event) {
    const { searchString } = this.state;
    const ownerItem = this.findRoomIdByMemberId(searchString);

    if (ownerItem && ownerItem.length > 0) {
      Modal.info({
        title: '搜索结果',
        centered: true,
        content: (
          <div className={ style.infoBox }>
            <table className={ style.infoTable }>
              <thead>
                <tr>
                  <th>小偶像名字</th>
                  <th>小偶像ID</th>
                  <th>房间ID</th>
                </tr>
              </thead>
              <tbody>
                {
                  ownerItem.map((item, index) => {
                    return (
                      <tr key={ item.ownerId }>
                        <td>{ item.ownerName }</td>
                        <td>{ item.ownerId }</td>
                        <td>{ item.targetId }</td>
                      </tr>
                    );
                  })
                }
              </tbody>
            </table>
          </div>
        )
      });
    } else {
      message.info('没有数据');
    }
  }

  // 退出并清除缓存
  async handleExitAndClearClick(event) {
    try {
      await this.props.action.clearLoginInformation();
      await this.props.action.clearMemberInformation();
      this.props.action.loginInformation({
        data: null
      });
    } catch (err) {
      console.error(err);
    }
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const loginInformation = this.props.loginInformation;

    // 渲染搜索结果
    const resultEle = [];

    this.state.searchResult.map((item, index) => {
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
        <Affix className={ publicStyle.affix }>
          <div className={ classNames(publicStyle.toolsBox, 'clearfix') }>
            <div className={ publicStyle.fr }>
              <Popconfirm title="确定退出登录并清除缓存吗？" onConfirm={ this.handleExitAndClearClick.bind(this) }>
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
                <Form onSubmit={ this.handleSubmit.bind(this) }>
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
                      })(<Input.Password />)
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
                    onChange={ this.handleInputChange.bind(this) }
                    onPressEnter={ this.handleSearchInformationClick.bind(this) }
                  />
                  <Button className={ publicStyle.ml10 }
                    type="primary"
                    onClick={ this.handleSearchInformationClick.bind(this) }
                  >
                    搜索
                  </Button>
                  { resultEle }
                </div>
              </Card>
              <Table columns={ this.columns() }
                size="middle"
                rowKey={ (item) => item.memberId }
                bordered={ true }
                dataSource={ loginInformation
                  ? format(loginInformation.value.friends, 0, loginInformation.value.friends.length - 1)
                  : []
                }
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