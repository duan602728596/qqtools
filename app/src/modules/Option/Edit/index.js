import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import { createSelector, createStructuredSelector } from 'reselect';
import { Form, Input, Checkbox, Affix, Button, Table, Modal, message, Popconfirm } from 'antd';
import interfaceOption, { customProfilesObj2Array } from './interface';
import style from './style.sass';
import { putOption } from '../store/reducer';
import { copy } from '../../publicMethod/editOperation';

/**
 * 预留命令：微打赏、直播、天气、机器人
 * 微打赏：微打赏、wds
 * 直播：直播列表、zb
 * 天气：天气预报、tq
 * 机器人：say
 */
const COMMAND: string = `微打赏|wds|直播列表|zb|天气预报|tq|say|help`;

/* 判断当前的cmd是否存在，并且返回index */
function getIndex(lists: Array, cmd: text): ?number{
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
  constructor(props: Object): void{
    super(props);

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
        render: (text: string, item: Object, index: number): Object=>{
          return (
            <pre>{ text }</pre>
          );
        }
      },
      {
        title: '操作',
        key: 'handle',
        render: (text: string, item: Object, index: number): Array=>{
          return [
            <Button key={ 0 } className={ style.mr10 } size="small" onClick={ this.onEdit.bind(this, item) }>修改</Button>,
            <Popconfirm key={ 1 } title="确认要删除吗？" onConfirm={ this.onDelete.bind(this, item) }>
              <Button size="small">删除</Button>
            </Popconfirm>
          ];
        }
      }
    ];
    return columns;
  }
  // 表单的change事件
  onInputChange(key: string, event: Object): void{
    this.setState({
      [key]: event.target.value
    });
  }
  // modal显示
  onModalOpen(event: Object): void{
    this.setState({
      modalDisplay: true
    });
  }
  // modal关闭事件
  onModalClose(event: Object): void{
    this.setState({
      modalDisplay: false,
      cmd: '',
      text: '',
      item: null
    });
  }
  // 添加
  onAdd(event: Object): void{
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
  onEdit(item: Object, event: Object): void{
    this.setState({
      modalDisplay: true,
      cmd: item.command,
      text: item.text,
      item: item
    });
  }
  // 保存编辑
  onSave(){
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
  onDelete(item: Object, event: Object): void{
    const index: number = getIndex(this.state.customProfiles, item.command);
    this.state.customProfiles.splice(index, 1);
    this.setState({
      customProfiles: this.state.customProfiles
    });
  }
  // 提交
  onSubmit(event: Object): void{
    event.preventDefault();
    this.props.form.validateFields(async (err: any, value: Object): void=>{
      if(!err){
        const data: Object = interfaceOption(value, this.state.customProfiles);
        await this.props.action.putOption({
          data
        });
        this.props.history.push('/Option');
      }
    });
  }
  render(): Array{
    const detail: ?Object = 'query' in this.props.location ? this.props.location.query.detail : null;
    const { getFieldDecorator } = this.props.form;
    return [
      <Form key={ 0 } className={ style.form } layout="inline" onSubmit={ this.onSubmit.bind(this) }>
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
              })(
                <Input placeholder="输入配置名称" readOnly={ detail } />
              )
            }
          </Form.Item>
          <Form.Item label="监视群名称">
            {
              getFieldDecorator('groupName', {
                initialValue: detail ? detail.groupName : '',
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
          <hr className={ style.line } />
        </div>
        {/* 微打赏配置 */}
        <h4 className={ style.title }>微打赏配置：</h4>
        <div>
          <Form.Item className={ style.mb15 } label="开启微打赏功能">
            {
              getFieldDecorator('isWds', {
                initialValue: detail ? (detail.basic.isWds ? ['isWds'] : [] ): []
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
          <Form.Item className={ style.mb15 } label="微打赏ID">
            {
              getFieldDecorator('wdsId', {
                initialValue: detail ? detail.basic.wdsId : ''
              })(
                <Input />
              )
            }
          </Form.Item>
          <br />
          <Form.Item className={ style.mb15 } label="微打赏命令">
            <div className="clearfix">
              {
                getFieldDecorator('wdsUrlTemplate', {
                  initialValue: detail ? detail.basic.wdsUrlTemplate :
                    `微打赏：{{ wdsname }}\nhttps://wds.modian.com/show_weidashang_pro/{{ wdsid }}#1`
                })(
                  <Input.TextArea className={ style.template } rows={ 15 } />
                )
              }
              <p className={ style.shuoming }>
                <b>模板关键字：</b>
                <br />
                wdsname：微打赏的名称，
                <br />
                wdsid：微打赏的ID
              </p>
            </div>
          </Form.Item>
          <br />
          <Form.Item label="微打赏模板">
            <div className="clearfix">
              {
                getFieldDecorator('wdsTemplate', {
                  initialValue: detail ? detail.basic.wdsTemplate :
                    `@{{ id }} 刚刚在【{{ wdsname }}】打赏了{{ money }}元，排名提高了{{ rankingchage }}名，当前排名第{{ ranking }}名。` +
                    `感谢这位聚聚！\n已筹集资金：{{ amount }}元。\n微打赏地址：https://wds.modian.com/show_weidashang_pro/{{ wdsid }}#1`
                })(
                  <Input.TextArea className={ style.template } rows={ 15 } />
                )
              }
              <p className={ style.shuoming }>
                <b>模板关键字：</b>
                <br />
                id：打赏人的ID，
                <br />
                money：打赏金额，
                <br />
                amount：总金额，
                <br />
                ranking：当前排名，
                <br />
                rankingchage：排名变化（提高），
                <br />
                wdsname：微打赏的名称，
                <br />
                wdsid：微打赏的ID
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
                initialValue: detail ? (detail.basic.is48LiveListener ? ['is48LiveListener'] : []) : []
              })(
                <Checkbox.Group options={[
                  {
                    label: '',
                    value: 'is48LiveListener'
                  }
                ]} />
              )
            }
          </Form.Item>
          <Form.Item className={ style.mb15 } label="监听所有成员">
            {
              getFieldDecorator('isListenerAll', {
                initialValue: detail ? (detail.basic.isListenerAll ? ['isListenerAll'] : []) : []
              })(
                <Checkbox.Group options={[
                  {
                    label: '',
                    value: 'isListenerAll'
                  }
                ]} />
              )
            }
          </Form.Item>
          <br />
          <Form.Item label="监听成员">
            <div className="clearfix">
              {
                getFieldDecorator('kd48LiveListenerMembers', {
                  initialValue: detail ? detail.basic.kd48LiveListenerMembers : ''
                })(
                  <Input.TextArea className={ style.template } rows={ 15 } />
                )
              }
              <p className={ style.shuoming }>多个成员名字之间用","（半角逗号）分隔。</p>
            </div>
          </Form.Item>
        </div>
        {/* 新成员欢迎 */}
        <h4 className={ style.title }>新成员欢迎：</h4>
        <div>
          <Form.Item className={ style.mb15 } label="开启新成员欢迎功能">
            {
              getFieldDecorator('isNewBlood', {
                initialValue: detail ? (detail.basic.isNewBlood ? ['isNewBlood'] : []) : []
              })(
                <Checkbox.Group options={[
                  {
                    label: '',
                    value: 'isNewBlood'
                  }
                ]} />
              )
            }
          </Form.Item>
          <br />
          <Form.Item label="欢迎语模板">
            <div className="clearfix">
              {
                getFieldDecorator('newBloodTemplate', {
                  initialValue: detail ? detail.basic.newBloodTemplate : `欢迎@{{ name }} 加入群。`
                })(
                  <Input.TextArea className={ style.template } rows={ 15 } />
                )
              }
              <p className={ style.shuoming }>
                <b>模板关键字：</b>
                <br />
                name：新入群的成员昵称
              </p>
            </div>
          </Form.Item>
        </div>
        {/* 心知天气 */}
        <h4 className={ style.title }>心知天气：</h4>
        <div>
          <p className={ style.mb15 }>该接口用来查询天气情况，目前官方的个人查询限制为400次/时。</p>
          <p className={ style.mb15 }>
            请自行到心知天气的官方网站&nbsp;
            <b className={ style.url } id="copy-option-xinzhitianqi" onClick={ copy.bind(this, 'copy-option-xinzhitianqi') }>
              https://www.seniverse.com/
            </b>
            &nbsp;
            <Button icon="copy" title="复制" onClick={ copy.bind(this, 'copy-option-xinzhitianqi') } />
            &nbsp;注册账号并填写appKey。
          </p>
          <Form.Item className={ style.mb15 } label="开启心知天气的查询天气功能">
            {
              getFieldDecorator('isXinZhiTianQi', {
                initialValue: detail ? (detail.basic.isXinZhiTianQi ? ['isXinZhiTianQi'] : []) : []
              })(
                <Checkbox.Group options={[
                  {
                    label: '',
                    value: 'isXinZhiTianQi'
                  }
                ]} />
              )
            }
          </Form.Item>
          <Form.Item className={ style.mb15 } label="心知天气APIKey">
            {
              getFieldDecorator('xinZhiTianQiAPIKey', {
                initialValue: detail ? detail.basic.xinZhiTianQiAPIKey : ''
              })(
                <Input className={ style.w600 } placeholder="请输入您的APIKey" />
              )
            }
          </Form.Item>
          <br />
          <Form.Item label="天气情况模板">
            <div className="clearfix">
              {
                getFieldDecorator('xinZhiTianQiTemplate', {
                  initialValue: detail ? detail.basic.xinZhiTianQiTemplate :
                    `【{{ city }}】\n天气：{{ text }}\n温度：{{ temperature }}℃`
                })(
                  <Input.TextArea className={ style.template } rows={ 15 } />
                )
              }
              <p className={ style.shuoming }>
                <b>模板关键字：</b>
                <br />
                city：查询城市，
                <br />
                text：天气现象文字，
                <br />
                temperature：温度
              </p>
            </div>
          </Form.Item>
        </div>
        {/* 图灵机器人 */}
        <h4 className={ style.title }>图灵机器人：</h4>
        <div>
          <p className={ style.mb15 }>该接口用来和机器人对话，目前官方的个人查询限制为1000次/日。</p>
          <p className={ style.mb15 }>
            请自行到图灵机器人的官方网站&nbsp;
            <b className={ style.url } id="copy-option-tuling" onClick={ copy.bind(this, 'copy-option-tuling') }>
              http://www.tuling123.com/
            </b>
            &nbsp;
            <Button icon="copy" title="复制" onClick={ copy.bind(this, 'copy-option-tuling') } />
            &nbsp;注册账号并填写appKey。
          </p>
          <Form.Item className={ style.mb15 } label="开启图灵机器人功能">
            {
              getFieldDecorator('isTuLing', {
                initialValue: detail ? (detail.basic.isTuLing ? ['isTuLing'] : []) : []
              })(
                <Checkbox.Group options={[
                  {
                    label: '',
                    value: 'isTuLing'
                  }
                ]} />
              )
            }
          </Form.Item>
          <Form.Item className={ style.mb15 } label="图灵机器人APIKey">
            {
              getFieldDecorator('tuLingAPIKey', {
                initialValue: detail ? detail.basic.tuLingAPIKey : ''
              })(
                <Input className={ style.w600 } placeholder="请输入您的APIKey" />
              )
            }
          </Form.Item>
        </div>
        <hr className={ style.line } />
        {/* 自定义命令 */}
        <h4 className={ style.title }>自定义命令：</h4>
        <Button className={ style.addCustom } size="small" onClick={ this.onModalOpen.bind(this) }>添加新自定义命令</Button>
        <Table columns={ this.columns() }
          dataSource={ this.state.customProfiles }
          size="small"
          rowKey={ (item: Object): string=>item.command }
        />
      </Form>,
      /* 添加或修改自定义命令 */
      <Modal key={ 1 }
        title={ this.state.item ? '修改' : '添加' + '自定义命令' }
        visible={ this.state.modalDisplay }
        width="500px"
        maskClosable={ false }
        onOk={ this.state.item ? this.onSave.bind(this) : this.onAdd.bind(this) }
        onCancel={ this.onModalClose.bind(this) }
      >
        <div className={ style.customProfiles }>
          <label className={ style.customLine } htmlFor="customCmd">命令：</label>
          <Input className={ style.customLine }
            id="customCmd"
            readOnly={ this.state.item }
            value={ this.state.cmd }
            onChange={ this.onInputChange.bind(this, 'cmd') }
          />
          <label className={ style.customLine } htmlFor="customText">文本：</label>
          <Input.TextArea className={ style.customLine }
            id="customText"
            rows={ 15 }
            value={ this.state.text }
            onChange={ this.onInputChange.bind(this, 'text') }
          />
        </div>
      </Modal>
    ];
  }
}

export default Add;