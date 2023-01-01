import type { ReactNode } from 'react';
import { Checkbox } from 'antd';
import type { CustomComponentFuncArgs, BooleanItem } from 'antd-schema-form/es/types';

function checkboxDesc({ root, form, required }: CustomComponentFuncArgs<BooleanItem>): ReactNode {
  const { description }: BooleanItem = root;

  return <Checkbox>{ description }</Checkbox>;
}

export default checkboxDesc;