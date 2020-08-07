import * as React from 'react';
import { useEffect, ReactElement, MouseEvent } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { Dispatch } from 'redux';
import { createSelector, createStructuredSelector, Selector } from 'reselect';
import type { Map as IMap } from 'immutable';
import { Link } from 'react-router-dom';
import { Button, Space, Table, Popconfirm } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import style from './index.sass';
import { queryOptionsList, deleteOption } from '../models/models';
import dbConfig from '../../../function/dbInit/dbConfig';
import type { OptionsItem } from '../../../types';

/* state */
interface SelectorRData {
  optionsList: Array<OptionsItem>;
}

const state: Selector<{ [k: string]: IMap<string, any> }, SelectorRData> = createStructuredSelector({
  // 配置列表
  optionsList: createSelector(
    ({ options: $$options }: { options: IMap<string, any> }): Array<any> => $$options.get('optionsList').toJS(),
    (data: Array<OptionsItem>): Array<OptionsItem> => (data)
  )
});

/* 配置列表 */
function Options(props: {}): ReactElement {
  const { optionsList }: SelectorRData = useSelector(state);
  const dispatch: Dispatch = useDispatch();

  // 删除
  function handleDeleteClick(record: OptionsItem, event?: MouseEvent): void {
    dispatch(deleteOption({
      query: record.id
    }));
  }

  const columns: ColumnsType<OptionsItem> = [
    { title: '配置名称', dataIndex: 'name' },
    {
      title: '操作',
      key: 'handle',
      width: 140,
      render: (value: undefined, record: OptionsItem, index: number): ReactElement => {
        return (
          <Button.Group>
            <Link to={ `Edit/${ record.id }` }>
              <Button>修改</Button>
            </Link>
            <Popconfirm title="确定要删除吗？" onConfirm={ (event?: MouseEvent): void => handleDeleteClick(record, event) }>
              <Button type="primary" danger={ true }>删除</Button>
            </Popconfirm>
          </Button.Group>
        );
      }
    }
  ];

  useEffect(function(): void {
    dispatch(queryOptionsList({
      query: { indexName: dbConfig.objectStore[0].data[0] }
    }));
  }, []);

  return (
    <div className={ style.content }>
      <Space className={ style.toolsBtnGroup }>
        <Link to="Edit">
          <Button type="primary">添加配置</Button>
        </Link>
        <Link to="../">
          <Button type="primary" danger={ true }>返回</Button>
        </Link>
      </Space>
      <Table columns={ columns } dataSource={ optionsList } rowKey="id" />
    </div>
  );
}

export default Options;