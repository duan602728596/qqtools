import * as React from 'react';
import { useState, useEffect, ReactElement, ReactNodeArray, Dispatch as D, SetStateAction as S } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { Dispatch } from 'redux';
import { createSelector, createStructuredSelector, Selector } from 'reselect';
import type { Map as IMap } from 'immutable';
import { Link } from 'react-router-dom';
import { Select, Button, Space } from 'antd';
import style from './index.sass';
import { queryOptionsList } from '../Options/models/models';
import dbConfig from '../../function/dbInit/dbConfig';
import type { OptionsItem } from '../../types';

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

/* 登陆 */
function Index(props: {}): ReactElement {
  const { optionsList }: SelectorRData = useSelector(state);
  const dispatch: Dispatch = useDispatch();
  const [optionValue, setOptionValue]: [string, D<S<string>>] = useState('');

  // 选择配置
  function handleSelect(value: string): void {
    setOptionValue(value);
  }

  // 渲染select
  function optionsListSelectOptionRender(): ReactNodeArray {
    return optionsList.map((item: OptionsItem, index: number): ReactElement => {
      return <Select.Option key={ item.name } value={ item.id }>{ item.name }</Select.Option>;
    });
  }

  useEffect(function(): void {
    dispatch(queryOptionsList({
      query: { indexName: dbConfig.objectStore[0].data[0] }
    }));
  }, []);

  return (
    <div className={ style.content }>
      <Space className={ style.loginTools }>
        <Select className={ style.optionSelect } value={ optionValue } onSelect={ handleSelect }>
          { optionsListSelectOptionRender() }
        </Select>
        <Button type="primary">登陆</Button>
        <Link to="../">
          <Button type="primary" danger={ true }>返回</Button>
        </Link>
      </Space>
    </div>
  );
}

export default Index;