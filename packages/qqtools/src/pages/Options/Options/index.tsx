import * as React from 'react';
import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { Button, Space, Table } from 'antd';
import style from './index.sass';

/* 配置列表 */
function Options(props: {}): ReactElement {
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
    </div>
  );
}

export default Options;