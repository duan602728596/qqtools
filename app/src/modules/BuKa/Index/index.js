import React, { Component, Fragment } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { createSelector, createStructuredSelector } from 'reselect';
import { Affix, Table, Button, message, Select } from 'antd';
import $ from 'jquery';
import publicStyle from '../../publicMethod/public.sass';
import style from './style.sass';
import { cursorOption } from '../store/reducer';
import { readFile, bukaRequest } from './unit';
import { buka, record } from '../../../components/coolQ/chouka';
const path: Object = global.require('path');
const xlsx: Object = global.require('node-xlsx');

/* 初始化数据 */
const state: Function = createStructuredSelector({
  optionList: createSelector(              // QQ配置列表
    ($$state: Immutable.Map): ?Immutable.Map => $$state.has('buka') ? $$state.get('buka') : null,
    ($$data: ?Immutable.Map): Array=>{
      const optionList: Immutable.List | Array = $$data !== null ? $$data.get('optionList') : [];
      return optionList instanceof Array ? optionList : optionList.toJS();
    }
  )
});

/* dispatch */
const dispatch: Function = (dispatch: Function): Object=>({
  action: bindActionCreators({
    cursorOption
  }, dispatch)
});

@connect(state, dispatch)
class BuKa extends Component{
  state: {
    btnLoading: boolean,
    optionItemIndex: ?number,
    bukaList: string
  };

  constructor(): void{
    super(...arguments);

    this.state = {
      btnLoading: false,     // 按钮loading动画
      optionItemIndex: null, // 当前选择的配置索引
      bukaList: []           // 补卡列表
    };
  }
  UNSAFE_componentWillMount(): void{
    this.props.action.cursorOption({
      query: {
        indexName: 'time'
      }
    });
  }
  // select
  selectOption(): Array{
    return this.props.optionList.map((item: Object, index: number): void=>{
      const index1: string = `${ index }`;
      return (
        <Select.Option key={ index1 } value={ index1 }>
          { item.name }
        </Select.Option>
      );
    });
  }
  onOptionSelect(value: number, option: Object): void{
    this.setState({
      optionItemIndex: value
    });
  }
  // 表格配置
  columus(): Array{
    const columns: Array = [
      {
        title: 'UserID',
        key: 'userid',
        dataIndex: 'userid',
        width: '25%'
      },
      {
        title: '摩点昵称',
        key: 'nickname',
        dataIndex: 'nickname',
        width: '25%'
      },
      {
        title: '补卡次数',
        key: 'number',
        dataIndex: 'number',
        width: '25%'
      },
      {
        title: '补卡状态',
        key: 'status',
        dataIndex: 'status',
        width: '25%',
        render: (value: any, item: Object, index: number): Object=>{
          switch(value){
            case 0:
              return <span className={ style.status0 }>未补卡</span>;
            case 1:
              return <span className={ style.status1 }>补卡成功</span>;
            case 2:
              return <span className={ style.status2 }>补卡失败</span>;
          }
        }
      }
    ];
    return columns;
  }
  // 点击input
  onClickBukaXlsx(event: Event): void{
    $('#buka-xlsx').click();
  }
  // 选择文件
  onChangeFile(event: Event): void{
    const value: string = event.target.value;
    const f: Object = path.parse(value);
    if(value === ''){
      return void 0;
    }else if(f.ext !== '.xlsx'){
      message.error('请选择*.xlsx格式的文件！');
      return void 0;
    }
    // 读取文件
    const result: Array = xlsx.parse(value);
    const data: Array = result[0].data;
    // 写入列表
    const bukaList: Array = [];
    for(let i: number = 0, j: number = data.length; i < j; i++){
      const item: Array = data[i];
      bukaList.push({
        id: i,              // 序号
        userid: item[0],    // userid
        nickname: item[1],  // 摩点昵称
        number: item[2],    // 补卡次数
        status: 0           // 补卡状态
      });
    }
    this.setState({
      bukaList
    });
  }
  // 补卡流程
  async onBuka(event: Event): Promise<void>{
    try{
      const option: Object = this.props.optionList[this.state.optionItemIndex];
      const basic: Object = option.basic;
      const json: Object = await readFile(basic.choukaFile);
      const len: Object = {
        n: basic.choukaN,
        r: basic.choukaR,
        sr: basic.choukaSR,
        ssr: basic.choukaSSR
      };
      for(let i: number = 0, j: number = this.state.bukaList.length; i < j; i++){
        const item: Object = this.state.bukaList[i];
        const bk: Array = buka(json, item.number, len);
        const rd: Array<string> = record(bk);
        const res: Object = await bukaRequest(basic, {
          nickname: item.nickname,
          userid: item.userid,
          token: basic.choukaToken,
          record: rd
        });
        item.status = res.status === 200 ? 1 : 2;
      }
      this.setState({
        bukaList: this.state.bukaList
      }, (): void=>{
        message.success('补卡完成！');
      });
    }catch(err){
      console.error(err);
      message.error('补卡失败！');
    }
  }
  render(): Object{
    return (
      <Fragment>
        <Affix key={ 0 } className={ publicStyle.affix }>
          <div className={ `${ publicStyle.toolsBox } clearfix` }>
            <div className={ publicStyle.fl }>
              <Button className={ publicStyle.mr10 }
                icon="file-excel"
                loading={ this.state.btnLoading }
                onClick={ this.onClickBukaXlsx.bind(this) }
              >
                导入Excel
              </Button>
              <input className={ style.disNone } id="buka-xlsx" type="file" onChange={ this.onChangeFile.bind(this) } />
              <label>选择一个配置文件：</label>
              <Select className={ `${ publicStyle.mr10 } ${ style.select }` }
                dropdownClassName={ style.select }
                disabled={ this.state.btnLoading }
                value={ this.state.optionItemIndex }
                onSelect={ this.onOptionSelect.bind(this) }
              >
                { this.selectOption() }
              </Select>
              <Button type="primary"
                icon="credit-card"
                loading={ this.state.btnLoading }
                disabled={ this.state.optionItemIndex === null }
                onClick={ this.onBuka.bind(this) }
              >
                补卡
              </Button>
            </div>
            <div className={ publicStyle.fr }>
              <Link to="/">
                <Button type="danger" icon="poweroff">返回</Button>
              </Link>
            </div>
          </div>
        </Affix>
        <div key={ 1 } className={ publicStyle.tableBox }>
          <p className={ `${ style.shuoming }` }>
            补卡说明：xlsx文件的第一列填写userid（从数据库中查找），第二列填写摩点昵称，第三列填写补卡次数。导入xlsx文件。请仔细核对后补卡。
          </p>
          <Table columns={ this.columus() }
            rowKey={ (item: Object): number => item.id }
            dataSource={ this.state.bukaList }
            pagination={{
              pageSize: 20,
              showQuickJumper: true
            }}
          />
        </div>
      </Fragment>
    );
  }
}

export default BuKa;