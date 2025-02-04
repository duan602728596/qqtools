import { randomUUID } from 'node:crypto';
import {
  Fragment,
  useState,
  useEffect,
  type ReactElement,
  type ReactNode,
  type Dispatch as D,
  type SetStateAction as S,
  type MouseEvent
} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { Dispatch } from '@reduxjs/toolkit';
import { createStructuredSelector, Selector } from 'reselect';
import { Link } from 'react-router';
import { Select, Button, Space, Table, message, Alert } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { DefaultOptionType } from 'antd/es/select';
import type { UseMessageReturnType } from '@qqtools-types/antd';
import style from './index.sass';
import { queryOptionsList, OptionsInitialState } from '../Options/reducers/options';
import { setAddLogin, setDeleteLogin, getRoomId, LoginInitialState } from './reducers/reducers';
import dbConfig from '../../utils/IDB/IDBConfig';
import MiraiQQ from '../../QQ/QQBotModals/MiraiQQ';
import GoCQHttp from '../../QQ/QQBotModals/GoCQHttp';
import ConsoleTest from '../../QQ/QQBotModals/ConsoleTest';
import { formatToV2Config, formatOptionType } from '../../QQ/function/formatConfig';
import { getGroupNumbers } from '../../QQ/function/qq/qqUtils';
import { QQProtocol, type QQModals } from '../../QQ/QQBotModals/ModalTypes';
import type { OptionsItem, OptionsItemValueV2, MemberInfo } from '../../commonTypes';

/* redux selector */
type RSelector = {
  optionsList: Array<OptionsItem>;
  loginList: Array<QQModals>;
};
type RState = {
  options: OptionsInitialState;
  login: LoginInitialState;
};

const selector: Selector<RState, RSelector> = createStructuredSelector({
  // 配置列表
  optionsList: ({ options }: RState): Array<OptionsItem> => options.optionsList,

  // 登陆列表
  loginList: ({ login }: RState): Array<QQModals> => login.loginList
});

/* 登陆 */
function Index(props: {}): ReactElement {
  const { optionsList, loginList }: RSelector = useSelector(selector);
  const dispatch: Dispatch = useDispatch();
  const [messageApi, messageContextHolder]: UseMessageReturnType = message.useMessage();
  const [optionValue, setOptionValue]: [string, D<S<string>>] = useState('');        // 配置的值
  const [loginLoading, setLoginLoading]: [boolean, D<S<boolean>>] = useState(false); // loading

  // 退出
  async function handleLogoutClick(qq: QQModals, event?: MouseEvent): Promise<void> {
    await qq.destroy();
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
      const index: number = optionsList.findIndex((o: OptionsItem): boolean => o.id === optionValue);
      const qqOptions: OptionsItemValueV2 = formatOptionType(formatToV2Config(optionsList[index].value));
      const id: string = randomUUID();
      let qq: QQModals | null = null;

      if (qqOptions.optionType === QQProtocol.GoCQHttp) {
        qq = new GoCQHttp({
          id,
          config: qqOptions,
          membersList: roomIdResult?.value,
          messageApi
        });
      } else if (qqOptions.optionType === QQProtocol.Mirai) {
        qq = new MiraiQQ({
          id,
          config: qqOptions,
          membersList: roomIdResult?.value,
          messageApi
        });
      } else if (qqOptions.optionType === QQProtocol.ConsoleTest) {
        qq = new ConsoleTest({
          id,
          config: qqOptions,
          membersList: roomIdResult?.value,
          messageApi
        });
      } else {
        messageApi.error('请先在“登录配置“中为当前的配置选择”配置类型”。');
      }

      if (qq) {
        const result: boolean = await qq.init();

        if (result) {
          dispatch(setAddLogin(qq));
          messageApi.success('登录成功！');
        }
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
  const loginSelectOptions: Array<DefaultOptionType> = optionsList.map((o: OptionsItem): DefaultOptionType => ({
    value: o.id,
    label: o.name
  }));

  const columns: ColumnsType<QQModals> = [
    {
      title: '登陆配置',
      dataIndex: 'config',
      render: (value: OptionsItemValueV2, record: QQModals, index: number): string => value.optionName
    },
    {
      title: 'QQ',
      dataIndex: 'qqNumber',
      render: (value: undefined, record: QQModals, index: number): number => record.config.qqNumber
    },
    {
      title: '群号',
      dataIndex: 'groupNumber',
      render: (value: undefined, record: QQModals, index: number): string => getGroupNumbers(record.config.groupNumber).join(', ')
    },
    {
      title: '协议',
      key: 'protocol',
      render: (value: undefined, record: QQModals, index: number): string => record.protocol
    },
    {
      title: '操作',
      dataIndex: 'handle',
      width: 130,
      render: (value: undefined, record: QQModals, index: number): ReactElement => (
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
    <Fragment>
      <div className="p-[16px]">
        <Space className="mb-[16px]">
          <Select className={ style.optionSelect } value={ optionValue } options={ loginSelectOptions } onSelect={ handleSelect } />
          <Button type="primary" disabled={ optionValue === '' } loading={ loginLoading } onClick={ handleLoginClick }>
            登陆
          </Button>
          <Link to="../">
            <Button type="primary" danger={ true }>返回</Button>
          </Link>
        </Space>
        <Alert className="mb-[16px]" type="warning" message="弹出的小红书网页需要登录后才能计算API的加密。" />
        <Table columns={ columns } dataSource={ loginList } rowKey="id" />
      </div>
      { messageContextHolder }
    </Fragment>
  );
}

export default Index;