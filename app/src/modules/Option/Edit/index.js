import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import { createSelector, createStructuredSelector } from 'reselect';
import { Form, Input, Affix, Button, Table, Modal, message, Popconfirm, Card, Checkbox } from 'antd';
import interfaceOption, { customProfilesObj2Array } from './interface';
import style from './style.sass';
import { putOption } from '../store/reducer';
import BasicConfiguration from './Forms/BasicConfiguration';
import ModianConfiguration from './Forms/ModianConfiguration';
import Koudai48LiveListener from './Forms/Koudai48LiveListener';
import Koudai48RoomListener from './Forms/Koudai48RoomListener';
import WeiboConfiguration from './Forms/WeiboConfiguration';
import NewGroupMember from './Forms/NewGroupMember';
import TimingMessagePush from './Forms/TimingMessagePush';
import * as ShuoMing from './utils/shuoming';

/**
 * 预留命令：摩点、集资、直播、天气、机器人
 * 微打赏：摩点、mod
 * 直播：直播列表、zb
 */
const COMMAND: string = '摩点|集资|mod|直播列表|zb|help';

/* 判断当前的cmd是否存在，并且返回index */
function getIndex(lists: Array, cmd: string): ?number{
  let index: number = null;
  for(let i: number = 0, j: number = lists.length; i < j; i++){
    const reg: RegExp = new RegExp(`^\\s*(${ lists[i].command }|${ COMMAND })\\s*$`, 'i');
    if(reg.test(cmd)){
      index = i;
      break;
    }
  }
  return index;
}

/* 初始化数据 */
const state: Function = createStructuredSelector({});

/* dispatch */
const dispatch: Function = (dispatch: Function): Object=>({
  action: bindActionCreators({
    putOption
  }, dispatch)
});

@withRouter
@Form.create()
@connect(state, dispatch)
class Add extends Component{
  state: {
    customProfiles: Object[],
    modalDisplay: boolean,
    cmd: string,
    text: string,
    item: ?{
      command: string,
      text: string
    }
  };

  static propTypes: Object = {
    action: PropTypes.objectOf(PropTypes.func),
    form: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    match: PropTypes.object
  };

  constructor(): void{
    super(...arguments);

    this.state = {
      customProfiles: [],  // 自定义配置
      modalDisplay: false, // modal显示
      cmd: '',             // 表单cmd
      text: '',            // 表单文字
      item: null           // 被选中
    };
  }
  componentDidMount(): void{
    if('query' in this.props.location){
      this.setState({
        customProfiles: customProfilesObj2Array(this.props.location.query.detail.custom)
      });
    }
  }
  // 图表配置
  columns(): Array{
    const columns: Array = [
      {
        title: '命令',
        dataIndex: 'command',
        key: 'command',
        width: '20%'
      },
      {
        title: '文本',
        dataIndex: 'text',
        key: 'text',
        width: '60%',
        render: (value: string, item: Object, index: number): React.Element=>{
          return (
            <pre>{ value }</pre>
          );
        }
      },
      {
        title: '操作',
        key: 'handle',
        width: '20%',
        render: (value: any, item: Object, index: number): React.ChildrenArray<React.Element>=>{
          return [
            <Button key="edit" className={ style.mr10 } size="small" onClick={ this.handleEditClick.bind(this, item) }>修改</Button>,
            <Popconfirm key="delete" title="确认要删除吗？" onConfirm={ this.handleDeleteClick.bind(this, item) }>
              <Button size="small">删除</Button>
            </Popconfirm>
          ];
        }
      }
    ];
    return columns;
  }
  // 表单的change事件
  handleInputChange(key: string, event: Event): void{
    this.setState({
      [key]: event.target.value
    });
  }
  // modal显示
  handleModalOpenClick(event: Event): void{
    this.setState({
      modalDisplay: true
    });
  }
  // modal关闭事件
  handleModalCloseClick(event: Event): void{
    this.setState({
      modalDisplay: false,
      cmd: '',
      text: '',
      item: null
    });
  }
  // 添加
  handleAddClick(event: Event): void{
    if(getIndex(this.state.customProfiles, this.state.cmd) === null){
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
    }else{
      message.error('该命令已存在！');
    }
  }
  // 编辑
  handleEditClick(item: Object, event: Event): void{
    this.setState({
      modalDisplay: true,
      cmd: item.command,
      text: item.text,
      item
    });
  }
  // 保存编辑
  handleSaveClick(event: Event): void{
    if(getIndex(this.state.customProfiles, this.state.cmd) === null || this.state.cmd === this.state.item.command){
      const index: number = getIndex(this.state.customProfiles, this.state.item.command);
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
    }else{
      message.error('该命令已存在！');
    }
  }
  // 删除
  handleDeleteClick(item: Object, event: Event): void{
    const index: number = getIndex(this.state.customProfiles, item.command);
    this.state.customProfiles.splice(index, 1);
    this.setState({
      customProfiles: this.state.customProfiles
    });
  }
  // 提交
  handleSubmit(event: Event): void{
    event.preventDefault();
    this.props.form.validateFields(async(err: any, value: Object): Promise<void>=>{
      if(!err){
        const data: Object = interfaceOption(value, this.state.customProfiles);
        await this.props.action.putOption({
          data
        });
        this.props.history.push('/Option');
      }
    });
  }
  render(): React.ChildrenArray<React.Element>{
    const { props }: { props: Object } = this;
    const detail: ?Object = 'query' in props.location ? props.location.query.detail : null;
    const { form }: { form: Object } = props;
    const { getFieldDecorator }: { getFieldDecorator: Function } = form;
    const colsArea1: Object = { labelCol: { span: 4 }, wrapperCol: { span: 20 } };

    const isHelpCommend: boolean = detail?.basic?.isHelpCommend; // 开启群内帮助命令

    return [
      <Form key="form" className={ style.form } onSubmit={ this.handleSubmit.bind(this) }>
        <Affix className={ style.affix }>
          <Button className={ style.saveBtn } type="primary" htmlType="submit" size="default" icon="hdd">保存</Button>
          <br />
          <Link to="/Option">
            <Button type="danger" size="default" icon="poweroff">返回</Button>
          </Link>
        </Affix>
        {/* 基础配置 */}
        <BasicConfiguration detail={ detail } { ...props } />
        {/* 摩点项目配置 */}
        <ModianConfiguration detail={ detail } { ...props } />
        {/* 口袋48直播监听配置 */}
        <Koudai48LiveListener detail={ detail } { ...props } />
        {/* 口袋48成员房间信息监听配置 */}
        <Koudai48RoomListener detail={ detail } { ...props } />
        {/* 成员微博监听配置 */}
        <WeiboConfiguration detail={ detail } { ...props } />
        {/* 欢迎新成员 */}
        <NewGroupMember detail={ detail } { ...props } />
        {/* 群内定时消息推送 */}
        <TimingMessagePush detail={ detail } { ...props } />
        {/* 帮助 */}
        <Card className={ style.mb10 } title="帮助命令">
          <Form.Item label="群内帮助命令" { ...colsArea1 }>
            {
              getFieldDecorator('isHelpCommend', {
                initialValue: isHelpCommend
              })(<Checkbox defaultChecked={ isHelpCommend } />)
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
            rowKey={ (item: Object): string=>item.command }
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