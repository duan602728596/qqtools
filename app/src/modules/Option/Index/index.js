import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { createSelector, createStructuredSelector } from 'reselect';
import { Affix, Table, Button, Popconfirm, Modal, message } from 'antd';
import style from './style.sass';
import publicStyle from '../../publicMethod/public.sass';
import { optionList, cursorOption, deleteOption, importOption } from '../store/reducer';
const path = node_require('path');
const fs = node_require('fs');

/* 初始化数据 */
const state: Function = createStructuredSelector({
  optionList: createSelector(         // 配置列表
    ($$state: Immutable): ?Immutable => $$state.has('option') ? $$state.get('option') : null,
    ($$data: ?Immutable): Array=>{
      const optionList: Object | Array = $$data !== null ? $$data.get('optionList') : [];
      return optionList instanceof Array ? optionList : optionList.toJS()
    }
  )
});

/* dispatch */
const dispatch: Function = (dispatch: Function): Object=>({
  action: bindActionCreators({
    optionList,
    cursorOption,
    deleteOption,
    importOption
  }, dispatch)
});

@connect(state, dispatch)
class Index extends Component{
  state: {
    visible1: boolean,
    visible2: boolean
  };
  constructor(props: Object): void{
    super(props);

    this.state = {
      visible1: false,
      visible2: false
    };
  }
  columns(): Array{
    const columns: Array = [
      {
        title: '配置名称',
        dataIndex: 'name',
        key: 'name',
        width: '35%'
      },
      {
        title: '监听群名称',
        dataIndex: 'groupName',
        key: 'groupName',
        width: '35%'
      },
      {
        title: '操作',
        key: 'handle',
        render: (text: string, item: Object, index: number): Array=>{
          return [
            <Link key={ 0 } to={{
              pathname: '/Option/Edit',
              query: {
                detail: item
              }
            }}>
              <Button className={ style.mr10 } size="small">修改</Button>
            </Link>,
            <Popconfirm key={ 1 } title="确认要删除该配置项吗？" onConfirm={ this.onDeleteOption.bind(this, item) }>
              <Button type="danger" size="small">删除</Button>
            </Popconfirm>
          ];
        }
      }
    ];
    return columns;
  }
  componentWillMount(): void{
    this.props.action.cursorOption({
      query: {
        indexName: 'time'
      }
    });
  }
  // 删除
  async onDeleteOption(item: Object, event: Event): void{
    const index: number = this.props.optionList.indexOf(item);
    await this.props.action.deleteOption({
      query: item.name
    });
    this.props.optionList.splice(index, 1);
    this.props.action.optionList({
      optionList: this.props.optionList.slice()
    });
  }
  // 显示弹出层
  onModalDisplay(key: string, value: boolean, event: Event): void{
    this.setState({
      [key]: value
    });
  }
  // 导入配置
  onExportConfiguration(event: Event): ?boolean{
    const files = $('#exportConfiguration').val();
    if(files === ''){
      message.error('必须选择一个保存位置！');
      return false;
    }
    const { ext }: { ext: string } = path.parse(files);
    if(ext !== '.json'){
      message.error('导出的必须是一个json文件！');
      return false;
    }
    const jsonStr: string = JSON.stringify({
      configuration: this.props.optionList
    }, null, 2);
    fs.writeFile(files, jsonStr, (err: any): void=>{
      if(err){
        message.error('导出失败！');
      }else{
        message.success('导出成功');
        this.onModalDisplay('visible1', false);
      }
    });
  }
  onImportConfiguration(event: Event): ?boolean{
    const files = $('#importConfiguration').val();
    if(files === ''){
      message.error('必须选择一个文件！');
      return false;
    }
    const { ext }: { ext: string } = path.parse(files);
    if(ext !== '.json'){
      message.error('导入的必须是一个json文件！');
      return false;
    }
    fs.readFile(files, {
      encoding: 'utf8'
    }, async (err: any, chunk: any): void=>{
      if(err){
        message.error('导入失败');
      }else{
        const data: Object = JSON.parse(chunk);
        if('configuration' in data){
          try{
            await this.props.action.importOption({
              data: data.configuration
            });
            await this.props.action.cursorOption({
              query: {
                indexName: 'time'
              }
            });
            message.success('导入成功');
            this.onModalDisplay('visible2', false);
          }catch(err){
            console.error(err);
            message.error('导入失败！');
          }
        }
      }
    });

  }
  render(): Array{
    return [
      <Affix key={ 0 } className={ publicStyle.affix }>
        <div className={ `${ publicStyle.toolsBox } clearfix` }>
          <div className={ publicStyle.fl }>
            <Link className={ style.mr10 } to="/Option/Edit">
              <Button type="primary" icon="plus-circle-o">添加新配置</Button>
            </Link>
            <Button className={ style.mr10 } icon="export" onClick={ this.onModalDisplay.bind(this, 'visible1', true) }>导出所有配置</Button>
            <Button icon="select" onClick={ this.onModalDisplay.bind(this, 'visible2', true) }>导入所有配置</Button>
          </div>
          <div className={ publicStyle.fr }>
            <Link className={ publicStyle.ml10 } to="/">
              <Button type="danger" icon="poweroff">返回</Button>
            </Link>
          </div>
        </div>
      </Affix>,
      /* 显示列表 */
      <div key={ 1 } className={ publicStyle.tableBox }>
        <Table dataSource={ this.props.optionList }
          columns={ this.columns() }
          rowKey={ (item: Object): string=>item.name }
          pagination={{
            pageSize: 20,
            showQuickJumper: true
          }}
        />
      </div>,
      /* 导出配置 */
      <Modal key={ 2 }
        title="导出配置"
        visible={ this.state.visible1 }
        onOk={ this.onExportConfiguration.bind(this) }
        onCancel={ this.onModalDisplay.bind(this, 'visible1', false) }
      >
        <input id="exportConfiguration" type="file" nwsaveas={ `backup_${ new Date().getTime() }.json` } />
      </Modal>,
      /* 导入配置 */
      <Modal key={ 3 }
        title="导入配置"
        visible={ this.state.visible2 }
        onOk={ this.onImportConfiguration.bind(this) }
        onCancel={ this.onModalDisplay.bind(this, 'visible2', false) }
      >
        <p className={ style.tishi }>同一配置名称会覆盖原有的配置。</p>
        <input id="importConfiguration" type="file" />
      </Modal>
    ];
  }
}

export default Index;