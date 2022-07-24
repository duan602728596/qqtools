import type { ReactElement } from 'react';
import { Checkbox, type FormInstance } from 'antd';
import type { BooleanItem } from 'antd-schema-form/es/types';

function checkboxDesc(root: BooleanItem, form: FormInstance, required: boolean): ReactElement {
  const { description }: BooleanItem = root;

  return <Checkbox>{ description }</Checkbox>;
}

export default checkboxDesc;