import { randomUUID } from 'node:crypto';
import { useEffect, type ReactElement } from 'react';
import { Input, type FormInstance } from 'antd';
import type { StringItem } from 'antd-schema-form/es/types';

interface RandomUUIDProps {
  id?: string;
  value?: string;
  onChange?: Function;
}

function RandomUUID(props: RandomUUIDProps): ReactElement {
  const { id, value, onChange }: RandomUUIDProps = props;

  useEffect(function(): void {
    if (!value) {
      onChange!(randomUUID());
    }
  }, [value, onChange]);

  return <Input id={ id } value={ value } readOnly={ true } />;
}

/* 随机生成ID */
function randomId(root: StringItem, form: FormInstance, required: boolean): ReactElement {
  return <RandomUUID />;
}

export default randomId;