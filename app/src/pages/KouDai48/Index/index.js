/* 口袋48登录和房间抓取 */
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { createSelector, createStructuredSelector } from 'reselect';
import { Affix, Button, Card, message, Form, Row, Col, Input, Popconfirm } from 'antd';
import classNames from 'classnames';
import publicStyle from '../../../components/publicStyle/public.sass';
import style from './style.sass';
import {
  loginInformation, getLoginInformation, putLoginInformation, cursorMemberInformation, clearLoginInformation,
  clearMemberInformation
} from '../reducer/reducer';
import LoginInformation from './LoginInformation';
import { login, getFriendsId } from '../../../components/kd48listerer/roomListener';

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

/* actions */
const actions = (dispatch) => ({
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
@connect(state, actions)
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
            getFriendsId(token)       // 获取好友id列表
            // requestRoomPage(token) // 获取房间留言列表
          ]);
          const value2 = {
            key: 'loginInformation',
            value: {
              friends: friends.content.data,  // 关注列表
              token,                          // token
              userInfo: content.userInfo,     // 本人信息
              userId: content.userInfo.userId // 账户ID
              // roomPage: roomPage.content.conversations
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
          </Row>
        </div>
      </Fragment>
    );
  }
}

export default KouDai48;