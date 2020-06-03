import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import { createSelector, createStructuredSelector } from 'reselect';
import { Form, Input, Affix, Button, Table, Modal, message, Popconfirm, Card, Checkbox } from 'antd';
import interfaceOption, { customProfilesObj2Array } from './interface';
import style from './style.sass';
import { putOption } from '../reducer/reducer';
import BasicConfiguration from './Forms/BasicConfiguration';
import ModianConfiguration from './Forms/ModianConfiguration';
import ChoukaConfiguration from './Forms/ChoukaConfiguration';
import Koudai48LiveListener from './Forms/Koudai48LiveListener';
import Koudai48RoomListener from './Forms/Koudai48RoomListener';
import WeiboConfiguration from './Forms/WeiboConfiguration';
import LvzhouConfiguration from './Forms/LvzhouConfiguration';
import NewGroupMember from './Forms/NewGroupMember';
import TimingMessagePush from './Forms/TimingMessagePush';
import * as ShuoMing from './utils/shuoming';

/**
 * 预留命令：摩点、集资、补卡、查卡、直播
 * 微打赏：摩点、mod
 * 直播：直播列表、zb
 */
const COMMAND = '摩点|集资|mod|补卡|查卡直播列表|zb|help';

/* 判断当前的cmd是否存在，并且返回index */
function getIndex(lists, cmd) {
  let index = null;

  for (let i = 0, j = lists.length; i < j; i++) {
    const reg = new RegExp(`^\\s*(${ lists[i].command }|${ COMMAND })\\s*$`, 'i');

    if (reg.test(cmd)) {
      index = i;
      break;
    }
  }

  return index;
}

/* 初始化数据 */
const state = createStructuredSelector({});

/* actions */
const actions = (dispatch) => ({
  action: bindActionCreators({
    putOption
  }, dispatch)
});

@withRouter
@Form.create()
@connect(state, actions)
class Add extends Component {
  static propTypes = {
    action: PropTypes.objectOf(PropTypes.func),
    form: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    match: PropTypes.object
  };

  constructor() {
    super(...arguments);

    this.state = {
      customProfiles: [], // 自定义配置
      modalDisplay: false, // modal显示
      cmd: '', // 表单cmd
      text: '', // 表单文字
      item: null // 被选中
    };
  }

  componentDidMount() {
    if ('query' in this.props.location) {
      this.setState({
        customProfiles: customProfilesObj2Array(this.props.location.query.detail.custom)
      });
    }
  }

  // 图表配置
  columns() {
    const columns = [
      {
        title: '命令',
        dataIndex: 'command',
        key: 'command',
        className: style.tableTd,
        width: '20%'
      },
      {
        title: '文本',
        dataIndex: 'text',
        className: style.tableTd,
        key: 'text'
      },
      {
        title: '操作',
        key: 'handle',
        width: '20%',
        render: (value, item, index) => {
          return [
            <Button key="edit" size="small" onClick={ this.handleEditClick.bind(this, item) }>修改</Button>,
            <Popconfirm key="delete" title="确认要删除吗？" onConfirm={ this.handleDeleteClick.bind(this, item) }>
              <Button className={ style.ml10 } size="small">删除</Button>
            </Popconfirm>
          ];
        }
      }
    ];

    return columns;
  }

  // 表单的change事件
  handleInputChange(key, event) {
    this.setState({
      [key]: event.target.value
    });
  }

  // modal显示
  handleModalOpenClick(event) {
    this.setState({
      modalDisplay: true
    });
  }

  // modal关闭事件
  handleModalCloseClick(event) {
    this.setState({
      modalDisplay: false,
      cmd: '',
      text: '',
      item: null
    });
  }

  // 添加
  handleAddClick(event) {
    if (getIndex(this.state.customProfiles, this.state.cmd) === null) {
      this.state.customProfiles.push({
        command: this.state.cmd,
        text: this.state.text
      });
      this.setState({
        modalDisplay: false,
        customProfiles: this.state.customProfiles,
        cmd: '',
        text: ''
      });
    } else {
      message.error('该命令已存在！');
    }
  }

  // 编辑
  handleEditClick(item, event) {
    this.setState({
      modalDisplay: true,
      cmd: item.command,
      text: item.text,
      item
    });
  }

  // 保存编辑
  handleSaveClick(event) {
    if (getIndex(this.state.customProfiles, this.state.cmd) === null || this.state.cmd === this.state.item.command) {
      const index = getIndex(this.state.customProfiles, this.state.item.command);

      this.state.customProfiles[index] = {
        command: this.state.cmd,
        text: this.state.text
      };
      this.setState({
        modalDisplay: false,
        customProfiles: this.state.customProfiles,
        cmd: '',
        text: ''
      });
    } else {
      message.error('该命令已存在！');
    }
  }

  // 删除
  handleDeleteClick(item, event) {
    const index = getIndex(this.state.customProfiles, item.command);

    this.state.customProfiles.splice(index, 1);
    this.setState({
      customProfiles: this.state.customProfiles
    });
  }

  // 提交
  handleSubmit(event) {
    event.preventDefault();

    this.props.form.validateFields(async (err, value) => {
      if (!err) {
        const data = interfaceOption(value, this.state.customProfiles);

        await this.props.action.putOption({
          data
        });
        this.props.history.push('/Option');
      }
    });
  }
  render() {
    const { props } = this;
    const detail = 'query' in props.location ? props.location.query.detail : null;
    const { form } = props;
    const { getFieldDecorator } = form;
    const colsArea1 = { labelCol: { span: 6 }, wrapperCol: { span: 18 } };
    const isHelpCommend = detail?.basic?.isHelpCommend; // 开启群内帮助命令

    return [
      <Form key="form" className={ style.form } onSubmit={ this.handleSubmit.bind(this) }>
        <Affix className={ style.affix }>
          <div>
            <Button className={ style.saveBtn } type="primary" htmlType="submit" size="default" icon="hdd">保存</Button>
            <br />
            <Link to="/Option">
              <Button id="a11111" type="danger" size="default" icon="poweroff">返回</Button>
            </Link>
          </div>
        </Affix>
        {/* 基础配置 */}
        <BasicConfiguration detail={ detail } { ...props } />
        {/* 摩点项目配置 */}
        <ModianConfiguration detail={ detail } { ...props } />
        {/* 摩点抽卡配置 */}
        <ChoukaConfiguration detail={ detail } { ...props } />
        {/* 口袋48直播监听配置 */}
        <Koudai48LiveListener detail={ detail } { ...props } />
        {/* 口袋48成员房间信息监听配置 */}
        <Koudai48RoomListener detail={ detail } { ...props } />
        {/* 成员微博监听配置 */}
        <WeiboConfiguration detail={ detail } { ...props } />
        {/* 成员绿洲监听配置 */}
        <LvzhouConfiguration detail={ detail } { ...props } />
        {/* 欢迎新成员 */}
        <NewGroupMember detail={ detail } { ...props } />
        {/* 群内定时消息推送 */}
        <TimingMessagePush detail={ detail } { ...props } />
        {/* 帮助 */}
        <Card className={ style.mb10 } title="帮助命令">
          <Form.Item label="群内帮助命令" { ...colsArea1 }>
            {
              getFieldDecorator('isHelpCommend', {
                initialValue: isHelpCommend ?? true,
                valuePropName: 'checked'
              })(<Checkbox />)
            }
            <ShuoMing.IsHelpCommend />
          </Form.Item>
        </Card>
        {/* 自定义命令 */}
        <Card title="自定义命令"
          extra={
            <Button className={ style.addCustom }
              size="small"
              onClick={ this.handleModalOpenClick.bind(this) }
            >
              添加新自定义命令
            </Button>
          }
        >
          <Table columns={ this.columns() }
            dataSource={ this.state.customProfiles }
            size="small"
            rowKey={ (item) => item.command }
          />
        </Card>
      </Form>,
      /* 添加或修改自定义命令 */
      <Modal key="modal"
        title={ this.state.item ? '修改' : '添加' + '自定义命令' }
        visible={ this.state.modalDisplay }
        width="500px"
        maskClosable={ false }
        onOk={ this.state.item ? this.handleSaveClick.bind(this) : this.handleAddClick.bind(this) }
        onCancel={ this.handleModalCloseClick.bind(this) }
      >
        <div className={ style.customProfiles }>
          <label className={ style.customLine } htmlFor="customCmd">命令：</label>
          <Input className={ style.customLine }
            id="customCmd"
            readOnly={ this.state.item }
            value={ this.state.cmd }
            onChange={ this.handleInputChange.bind(this, 'cmd') }
          />
          <label className={ style.customLine } htmlFor="customText">文本：</label>
          <Input.TextArea className={ style.customLine }
            id="customText"
            rows={ 15 }
            value={ this.state.text }
            onChange={ this.handleInputChange.bind(this, 'text') }
          />
        </div>
      </Modal>
    ];
  }
}

export default Add;