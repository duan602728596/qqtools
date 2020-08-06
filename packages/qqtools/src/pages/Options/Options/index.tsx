import * as React from 'react';
import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { Button, Table } from 'antd';
import style from './index.sass';

/* 配置列表 */
function Options(props: {}): ReactElement {
  return (
    <div className={ style.content }>
      <Button.Group className={ style.toolsBtnGroup }>
        <Button type="primary">添加配置</Button>
        <Link to="../">
          <Button type="primary" danger={ true }>返回</Button>
        </Link>
      </Button.Group>
    </div>
  );
}

export default Options;