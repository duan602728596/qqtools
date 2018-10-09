import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import { createSelector, createStructuredSelector } from 'reselect';
import { Form, Input, Checkbox, Affix, Button, Table, Modal, message, Popconfirm, InputNumber } from 'antd';
import interfaceOption, { customProfilesObj2Array } from './interface';
import style from './style.sass';
import { putOption } from '../store/reducer';
import { handleCopyClick, handleOpenBrowser } from '../../../utils';

/**
 * 预留命令：摩点、直播、天气、机器人
 * 微打赏：摩点、mod
 * 直播：直播列表、zb
 */
const COMMAND: string = '摩点|mod|直播列表|zb|help';

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
    const detail: ?Object = 'query' in this.props.location ? this.props.location.query.detail : null;
    const { getFieldDecorator }: { getFieldDecorator: Function } = this.props.form;
    // checkbox的值
    const isModian: boolean = detail?.basic?.isModian;                         // 摩点
    const is48LiveListener: boolean = detail?.basic?.is48LiveListener;         // 口袋48直播
    const isListenerAll: boolean = detail?.basic?.isListenerAll;               // 监听所有成员
    const isRoomListener: boolean = detail?.basic?.isRoomListener;             // 房间监听
    const isRoomSendImage: boolean = detail?.basic?.isRoomSendImage;           // 房间信息发送图片和链接
    const isWeiboListener: boolean = detail?.basic?.isWeiboListener;           // 微博监听
    const isNewGroupMember: boolean = detail?.basic?.isNewGroupMember;         // 新成员欢迎
    const isTimingMessagePush: boolean = detail?.basic?.isTimingMessagePush;   // 定时推送
    return [
      <Form key="form" className={ style.form } layout="inline" onSubmit={ this.handleSubmit.bind(this) }>
        <Affix className={ style.affix }>
          <Button className={ style.saveBtn } type="primary" htmlType="submit" size="default" icon="hdd">保存</Button>
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
                initialValue: detail ? detail.name : '',
                rules: [
                  {
                    message: '必须输入配置名称',
                    required: true,
                    whitespace: true
                  }
                ]
              })(<Input placeholder="输入配置名称" readOnly={ detail } />)
            }
          </Form.Item>
          <Form.Item label="QQ号">
            {
              getFieldDecorator('qqNumber', {
                initialValue: detail ? detail.qqNumber : '',
                rules: [
                  {
                    message: '必须输入QQ号',
                    required: true,
                    whitespace: true
                  }
                ]
              })(<Input placeholder="输入配置名称" />)
            }
          </Form.Item>
          <Form.Item label="Socket端口号">
            {
              getFieldDecorator('socketPort', {
                initialValue: detail ? detail.socketPort : '6700',
                rules: [
                  {
                    message: '必须输入Socket端口号',
                    required: true,
                    whitespace: true
                  }
                ]
              })(<Input placeholder="输入配置名称" />)
            }
          </Form.Item>
          <Form.Item label="监听群号">
            {
              getFieldDecorator('groupNumber', {
                initialValue: detail ? detail.groupNumber : '',
                rules: [
                  {
                    message: '必须输入要监听的群号',
                    required: true,
                    whitespace: true
                  }
                ]
              })(<Input placeholder="输入群号" />)
            }
          </Form.Item>
          <p className={ style.coolQP }>
            Sockte端口号请到
            <b>酷Q</b>文件下，找到
            <b>app/io.github.richardchien.coolqhttpapi</b>
            文件夹，编辑
            <b>config.cfg</b>
            文件，添加如下配置
          </p>
          <Input.TextArea className={ style.coolQShuoming }
            id="copy-option-shuoming"
            value={ '[QQ号]\nws_port=端口号(比如:6800)\n' }
            rows={ 4 }
            readOnly={ true }
          />
          <Button icon="copy" title="复制" onClick={ handleCopyClick.bind(this, 'copy-option-shuoming') } />
          <hr className={ style.line } />
        </div>
        {/* 摩点项目配置 */}
        <h4 className={ style.title }>摩点项目配置：</h4>
        <div>
          <Form.Item className={ style.mb15 } label="开启摩点相关功能">
            {
              getFieldDecorator('isModian', {
                initialValue: isModian
              })(<Checkbox defaultChecked={ isModian } />)
            }
          </Form.Item>
          <Form.Item className={ style.mb15 } label="摩点ID">
            {
              getFieldDecorator('modianId', {
                initialValue: detail ? detail.basic.modianId : ''
              })(<Input />)
            }
          </Form.Item>
          <br />
          <Form.Item className={ style.mb15 } label="摩点命令">
            <div className="clearfix">
              {
                getFieldDecorator('modianUrlTemplate', {
                  initialValue: detail ? detail.basic.modianUrlTemplate
                    : '摩点：{{ modianname }}\nhttps://m.modian.com/project/{{ modianid }}.html'
                })(<Input.TextArea className={ style.template } rows={ 5 } />)
              }
              <p className={ style.shuoming }>
                <b>模板关键字：</b>
                <br />
                modianname：摩点项目的名称，
                <br />
                modianid：摩点项目的ID
              </p>
            </div>
          </Form.Item>
          <br />
          <Form.Item label="集资提示">
            <div className="clearfix">
              {
                getFieldDecorator('modianTemplate', {
                  initialValue: detail ? detail.basic.modianTemplate
                    : ('@{{ id }} 刚刚在【{{ modianname }}】打赏了{{ money }}元，'
                     + '感谢这位聚聚！\n摩点项目地址：https://m.modian.com/project/{{ modianid }}.html\n'
                     + '当前进度：￥{{ alreadyraised }} / ￥{{ goal }}\n'
                     + '集资参与人数：{{ backercount }}人\n'
                     + '项目截止时间：{{ endtime }}')
                })(<Input.TextArea className={ style.template } rows={ 10 } />)
              }
              <p className={ style.shuoming }>
                <b>模板关键字：</b>
                <br />
                id：打赏人的ID，
                <br />
                money：打赏金额，
                <br />
                modianname：摩点项目的名称，
                <br />
                modianid：摩点项目的ID，
                <br />
                goal：摩点项目目标
                <br />
                alreadyraised：当前已打赏金额
                <br />
                backercount：集资参与人数
                <br />
                endtime：项目截止时间
              </p>
            </div>
          </Form.Item>
        </div>
        {/* 口袋48直播监听配置 */}
        <h4 className={ style.title }>直播监听：</h4>
        <div>
          <Form.Item className={ style.mb15 } label="开启口袋48直播监听功能">
            {
              getFieldDecorator('is48LiveListener', {
                initialValue: is48LiveListener
              })(<Checkbox defaultChecked={ is48LiveListener } />)
            }
          </Form.Item>
          <Form.Item className={ style.mb15 } label="监听所有成员">
            {
              getFieldDecorator('isListenerAll', {
                initialValue: isListenerAll
              })(<Checkbox defaultChecked={ isListenerAll } />)
            }
          </Form.Item>
          <Form.Item className={ style.mb15 } label="监听间隔（秒）">
            {
              getFieldDecorator('liveListeningInterval', {
                initialValue: detail ? detail.basic.liveListeningInterval : 15,
                rules: [
                  {
                    message: '必须输入监听间隔',
                    required: true
                  },
                  {
                    validator: (rule: Object, value: number, callback: Function): void =>{
                      if(value < 15){
                        callback(rule.message);
                      }else{
                        callback();
                      }
                    },
                    message: '监听间隔必须大于15秒'
                  }
                ]
              })(<InputNumber className={ style.w200 } />)
            }
          </Form.Item>
          <br />
          <Form.Item label="监听成员">
            <div className="clearfix">
              {
                getFieldDecorator('kd48LiveListenerMembers', {
                  initialValue: detail ? detail.basic.kd48LiveListenerMembers : ''
                })(<Input.TextArea className={ style.template } rows={ 5 } />)
              }
              <p className={ style.shuoming }>多个成员名字或成员ID之间用","（半角逗号）分隔。</p>
            </div>
          </Form.Item>
        </div>
        {/* 成员房间信息监听配置 */}
        <h4 className={ style.title }>成员房间信息监听配置：</h4>
        <p>如果未登录，无法监听成员房间信息。</p>
        <div>
          <Form.Item className={ style.mb15 } label="开启成员房间信息监听">
            {
              getFieldDecorator('isRoomListener', {
                initialValue: isRoomListener
              })(<Checkbox defaultChecked={ isRoomListener } />)
            }
          </Form.Item>
          <Form.Item className={ style.mb15 } label="房间ID">
            {
              getFieldDecorator('roomId', {
                initialValue: detail ? detail.basic.roomId : ''
              })(<Input />)
            }
          </Form.Item>
          <Form.Item className={ style.mb15 } label="发送图片和图片链接（只限于酷QPro版本）">
            {
              getFieldDecorator('isRoomSendImage', {
                initialValue: isRoomSendImage
              })(<Checkbox defaultChecked={ isRoomSendImage } />)
            }
          </Form.Item>
        </div>
        {/* 成员微博监听配置 */}
        <h4 className={ style.title }>成员微博监听配置：</h4>
        <p>
          微博lfid配置方法：
          <a onClick={ handleOpenBrowser.bind(this, 'https://github.com/duan602728596/qqtools/tree/master#微博的lfid查找方法') }>https://github.com/duan602728596/qqtools/tree/master#微博的lfid查找方法</a>
        </p>
        <div>
          <Form.Item className={ style.mb15 } label="开启成员微博监听">
            {
              getFieldDecorator('isWeiboListener', {
                initialValue: isWeiboListener
              })(<Checkbox defaultChecked={ isWeiboListener } />)
            }
          </Form.Item>
          <Form.Item className={ style.mb15 } label="微博lfid">
            {
              getFieldDecorator('lfid', {
                initialValue: detail ? detail.basic.lfid : ''
              })(<Input />)
            }
          </Form.Item>
        </div>
        {/* 欢迎新成员 */}
        <h4 className={ style.title }>欢迎新成员配置：</h4>
        <div>
          <Form.Item className={ style.mb15 } label="开启新成员欢迎功能">
            {
              getFieldDecorator('isNewGroupMember', {
                initialValue: isNewGroupMember
              })(<Checkbox defaultChecked={ isNewGroupMember } />)
            }
          </Form.Item>
          <br />
          <Form.Item label="欢迎词">
            <div className="clearfix">
              {
                getFieldDecorator('welcomeNewGroupMember', {
                  initialValue: detail ? detail.basic.welcomeNewGroupMember : '欢迎{{ nickname }}加入。'
                })(<Input.TextArea className={ style.template } rows={ 5 } />)
              }
              <p className={ style.shuoming }>
                <b>模板关键字：</b>
                <br />
                nickname：群成员的昵称
              </p>
            </div>
          </Form.Item>
        </div>
        {/* 群内定时消息推送 */}
        <h4 className={ style.title }>群内定时消息推送：</h4>
        <div>
          <Form.Item className={ style.mb15 } label="开启群内定时消息推送功能">
            {
              getFieldDecorator('isTimingMessagePush', {
                initialValue: isTimingMessagePush
              })(<Checkbox defaultChecked={ isTimingMessagePush } />)
            }
          </Form.Item>
          <Form.Item className={ style.mb15 } label="规则配置">
            {
              getFieldDecorator('timingMessagePushFormat', {
                initialValue: detail ? detail.basic.timingMessagePushFormat : ''
              })(<Input className={ style.w600 } />)
            }
          </Form.Item>
          <p>
            规则格式：
            <img className={ style.nodeScheduleFormat } src={ require('./node-schedule-format.webp') } />
          </p>
          <p>如果不配置该位置，则用“*”占位；</p>
          <p>
            多个时间段用“,”分割，比如
            <var className={ style.var }>2,4,6</var>
            表示；
          </p>
          <p>
            连续时间段用类似
            <var className={ style.var }>2-6</var>
            表示；
          </p>
          <p>
            每隔多长时间，可以用类似
            <var className={ style.var }>*/5</var>
            表示；
          </p>
          <p>每个规则不要有空格，规则和规则之间要有空格。</p>
          <br />
          <Form.Item label="推送消息">
            <div className="clearfix">
              {
                getFieldDecorator('timingMessagePushText', {
                  initialValue: detail ? detail.basic.timingMessagePushText : ''
                })(<Input.TextArea className={ style.template } rows={ 10 } />)
              }
            </div>
          </Form.Item>
        </div>
        <hr className={ style.line } />
        {/* 自定义命令 */}
        <h4 className={ style.title }>自定义命令：</h4>
        <Button className={ style.addCustom } size="small" onClick={ this.handleModalOpenClick.bind(this) }>添加新自定义命令</Button>
        <Table columns={ this.columns() }
          dataSource={ this.state.customProfiles }
          size="small"
          rowKey={ (item: Object): string=>item.command }
        />
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