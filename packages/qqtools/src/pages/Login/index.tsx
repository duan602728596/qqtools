import {
  useState,
  useEffect,
  ReactElement,
  ReactNodeArray,
  Dispatch as D,
  SetStateAction as S,
  MouseEvent
} from 'react';
import type { Dispatch } from 'redux';
import { useSelector, useDispatch } from 'react-redux';
import { createSelector, createStructuredSelector, Selector } from 'reselect';
import { Link } from 'react-router-dom';
import { Select, Button, Space, Table, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { random, findIndex } from 'lodash-es';
import style from './index.sass';
import { queryOptionsList, OptionsInitialState } from '../Options/reducers/reducers';
import { setAddLogin, setDeleteLogin, getRoomId, LoginInitialState } from './reducers/reducers';
import dbConfig from '../../utils/idb/dbConfig';
import QQ from '../../QQ/QQ';
import OicqQQ from '../../QQ/OicqQQ';
import { getGroupNumbers } from '../../QQ/utils/miraiUtils';
import type { OptionsItem, OptionsItemValue, MemberInfo } from '../../types';

/* redux selector */
interface SelectorRData {
  optionsList: Array<OptionsItem>;
  loginList: Array<QQ | OicqQQ>;
}

const selector: Selector<any, SelectorRData> = createStructuredSelector({
  // 配置列表
  optionsList: createSelector(
    ({ options }: { options: OptionsInitialState }): Array<OptionsItem> => options.optionsList,
    (data: Array<OptionsItem>): Array<OptionsItem> => (data)
  ),

  // 登陆列表
  loginList: createSelector(
    ({ login }: { login: LoginInitialState }): Array<QQ | OicqQQ> => login.loginList,
    (data: Array<QQ | OicqQQ>): Array<QQ | OicqQQ> => data
  )
});

/* 登陆 */
function Index(props: {}): ReactElement {
  const { optionsList, loginList }: SelectorRData = useSelector(selector);
  const dispatch: Dispatch = useDispatch();
  const [optionValue, setOptionValue]: [string, D<S<string>>] = useState('');        // 配置的值
  const [loginLoading, setLoginLoading]: [boolean, D<S<boolean>>] = useState(false); // loading

  // 退出
  async function handleLogoutClick(qq: QQ | OicqQQ, event?: MouseEvent): Promise<void> {
    await qq.destroy(loginList);
    dispatch(setDeleteLogin(qq));
  }

  // 登陆
  async function handleLoginClick(event: MouseEvent): Promise<void> {
    if (optionValue === '') return;

    setLoginLoading(true);

    try {
      const { result: roomIdResult }: { result: { value: Array<MemberInfo> } } = await dispatch(getRoomId({
        query: 'roomId'
      }));
      const index: number = findIndex(optionsList, { id: optionValue });
      const qqOptions: OptionsItemValue = optionsList[index].value;
      const id: string = String(random(1, 10000000));
      let qq: QQ | OicqQQ;

      if (qqOptions.optionType === '1') {
        qq = new OicqQQ(id, qqOptions, roomIdResult?.value);
      } else {
        qq = new QQ(id, qqOptions, roomIdResult?.value);
      }

      const result: boolean = await qq.init();

      if (result) {
        dispatch(setAddLogin(qq));
        message.success('登陆成功！');
      }
    } catch (err) {
      console.error(err);
    }

    setLoginLoading(false);
  }

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

  const columns: ColumnsType<QQ> = [
    {
      title: '登陆配置',
      dataIndex: 'config',
      render: (value: OptionsItemValue, record: QQ | OicqQQ, index: number): string => value.optionName
    },
    {
      title: 'QQ',
      dataIndex: 'qqNumber',
      render: (value: undefined, record: QQ | OicqQQ, index: number): number => record.config.qqNumber
    },
    {
      title: '群号',
      dataIndex: 'groupNumber',
      render: (value: undefined, record: QQ | OicqQQ, index: number): string => getGroupNumbers(record.config.groupNumber).join(', ')
    },
    {
      title: '操作',
      dataIndex: 'handle',
      width: 130,
      render: (value: undefined, record: QQ | OicqQQ, index: number): ReactElement => (
        <Button type="primary"
          danger={ true }
          onClick={ (event?: MouseEvent): Promise<void> => handleLogoutClick(record, event) }
        >
          退出
        </Button>
      )
    }
  ];

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
        <Button type="primary" disabled={ optionValue === '' } loading={ loginLoading } onClick={ handleLoginClick }>
          登陆
        </Button>
        <Link to="../">
          <Button type="primary" danger={ true }>返回</Button>
        </Link>
      </Space>
      <Table columns={ columns } dataSource={ loginList } rowKey="id" />
    </div>
  );
}

export default Index;