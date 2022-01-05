import { randomUUID } from 'node:crypto';
import * as path from 'node:path';
import { promises as fs } from 'node:fs';
import type { ParsedPath } from 'node:path';
import type { SaveDialogReturnValue, OpenDialogReturnValue } from 'electron';
import { dialog } from '@electron/remote';
import * as yaml from 'js-yaml';
import * as fse from 'fs-extra';
import { useEffect, type ReactElement, type MouseEvent } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { Dispatch } from '@reduxjs/toolkit';
import { createStructuredSelector, type Selector } from 'reselect';
import { Link } from 'react-router-dom';
import { Button, Space, Table, Popconfirm, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import * as dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import RoomId from './RoomId';
import { queryOptionsList, deleteOption, saveFormData, type OptionsInitialState } from '../reducers/reducers';
import dbConfig from '../../../utils/idb/dbConfig';
import type { OptionsItem } from '../../../types';

/* 判断yaml解析后是否为object类型 */
function isObject(val: unknown): val is number {
  return typeof val === 'object';
}

/* redux selector */
type RSelector = { optionsList: Array<OptionsItem> };
type RState = { options: OptionsInitialState };

const selector: Selector<RState, RSelector> = createStructuredSelector({
  // 配置列表
  optionsList: ({ options }: RState): Array<OptionsItem> => options.optionsList
});

/* 配置列表 */
function Options(props: {}): ReactElement {
  const { optionsList }: RSelector = useSelector(selector);
  const dispatch: Dispatch = useDispatch();

  // 导入配置
  async function handleImportConfigurationFileClick(event: MouseEvent): Promise<void> {
    const result: OpenDialogReturnValue = await dialog.showOpenDialog({
      properties: ['openFile']
    });

    if (result.canceled || !result.filePaths || result.filePaths.length === 0) return;

    const filePath: string = result.filePaths[0];
    const filePathResult: ParsedPath = path.parse(filePath);

    if (!/^\.ya?ml$/i.test(filePathResult.ext)) {
      return message.warn('请导入*.yaml或*.yml格式的文件！');
    }

    // 导入yaml文件
    const fsData: string = await fs.readFile(filePath, { encoding: 'utf8' });
    const yamlParseResult: unknown = yaml.load(fsData);

    if (!yamlParseResult || !isObject(yamlParseResult)) {
      return message.error('配置文件解析失败！');
    }

    const option: Array<OptionsItem> = yamlParseResult['qqtools']['option'];
    const time: string = yamlParseResult['qqtools']['time'] ?? dayjs().format('YYYY-MM-DD HH:mm:ss');

    // 重写id和name，避免重复
    option.forEach(function(value: OptionsItem, index: number): void {
      value.id = `${ value.id }_${ randomUUID().replaceAll('-', '') }`;
      value.name = `${ value.name }_${ time }`;
    });

    await dispatch(saveFormData({
      data: option
    }));
    message.success('配置文件导入成功！');

    // 改变ui
    dispatch(queryOptionsList({
      query: { indexName: dbConfig.objectStore[0].data[0] }
    }));
  }

  // 导出配置
  async function handleExportConfigurationFileClick(event: MouseEvent): Promise<void> {
    const time: Dayjs = dayjs();
    const result: SaveDialogReturnValue = await dialog.showSaveDialog({
      defaultPath: `配置备份_${ time.format('YYYY.MM.DD.HH.mm.ss') }_.yaml`
    });

    if (result.canceled || !result.filePath) return;

    // 导出为yaml
    const time1: string = time.format('YYYY-MM-DD HH:mm:ss');
    let ymlResult: string = yaml.dump({
      qqtools: {
        option: optionsList
      }
    });

    ymlResult = `# qqtools配置文件导出\n# ${ time1 }\n\n${ ymlResult }`;

    await fse.outputFile(result.filePath, ymlResult);
    message.success('配置文件导出成功！');
  }

  // 删除
  function handleDeleteClick(record: OptionsItem, event?: MouseEvent): void {
    dispatch(deleteOption({
      query: record.id
    }));
  }

  const columns: ColumnsType<OptionsItem> = [
    { title: '配置名称', dataIndex: 'name' },
    { title: 'QQ号', dataIndex: ['value', 'qqNumber'] },
    { title: '群号', dataIndex: ['value', 'groupNumber'] },
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
    <div className="p-[16px]">
      <div className="flex mb-[16px]">
        <Space className="grow">
          <Link to="Edit">
            <Button type="primary">添加配置</Button>
          </Link>
          <RoomId />
          <Link to="/">
            <Button type="primary" danger={ true }>返回</Button>
          </Link>
        </Space>
        <Space>
          <Button onClick={ handleImportConfigurationFileClick }>导入配置</Button>
          <Button onClick={ handleExportConfigurationFileClick }>导出配置</Button>
        </Space>
      </div>
      <Table columns={ columns } dataSource={ optionsList } rowKey="id" />
    </div>
  );
}

export default Options;