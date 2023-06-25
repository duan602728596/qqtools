import { setTimeout, clearTimeout } from 'node:timers';
import { useState, useRef, type ReactElement, type Dispatch as D, type SetStateAction as S, type MutableRefObject } from 'react';
import { AutoComplete, Spin, type FormInstance } from 'antd';
import type { CustomComponentFuncArgs, StringItem } from 'antd-schema-form/es/types';
import type { BaseOptionType } from 'rc-select/es/Select';
import { LoadingOutlined as IconLoadingOutlined } from '@ant-design/icons';
import style from './userInfoSearch.sass';
import { useReqRoomIdQuery, type ReqRoomId } from '../../../reducers/pocketFriends.api';
import type { RoomItem } from '../../../services/interface';

interface UserInfoSearchProps {
  form: FormInstance;
  root: StringItem;
  id?: string;
  value?: string;
  onChange?: Function;
}

/* 搜索serverId或liveRoomId */
function UserInfoSearchComponent(props: UserInfoSearchProps): ReactElement {
  const { id, value: formValue, onChange }: UserInfoSearchProps = props;
  const searchKey: string = id!.includes('pocket48LiveRoomId') ? 'liveRoomId' : 'serverId';

  const [userIdSearchResult, setUserIdSearchResult]: [Array<BaseOptionType>, D<S<Array<BaseOptionType>>>] = useState([]);
  const [userIdSearchLoading, setUserIdSearchLoading]: [boolean, D<S<boolean>>] = useState(false);
  const reqRoomId: ReqRoomId = useReqRoomIdQuery(undefined);
  const roomId: Array<RoomItem> = reqRoomId.data ?? [];
  const searchTimerRef: MutableRefObject<NodeJS.Timeout | null> = useRef(null);

  // 修改值
  function handleChange(value: string): void {
    onChange?.(value);
  }

  // 输入xox名字搜索
  function handleByContentSearch(value: string): void {
    if (searchTimerRef.current !== null) {
      clearTimeout(searchTimerRef.current);
      searchTimerRef.current = null;
    }

    if (!value) {
      setUserIdSearchLoading(false);
      setUserIdSearchResult([]);

      return;
    }

    setUserIdSearchLoading(true);
    searchTimerRef.current = setTimeout((): void => {
      const result: Array<BaseOptionType> = [];

      if (/^[\u4E00-\u9FFF]+$/i.test(value)) {
        // 搜索中文
        const regexp: RegExp = new RegExp(value, 'i');

        for (const item of roomId) {
          if (regexp.test(item.ownerName)) {
            result.push({
              label: `${ item.ownerName }（${ item[searchKey] }）`,
              value: `${ item[searchKey] }`
            });
          }
        }
      } else if (/^\d+$/i.test(value)) {
        // 搜索ID
        const regexp: RegExp = new RegExp(value, 'i');

        for (const item of roomId) {
          if (regexp.test(`${ item[searchKey] }`)) {
            result.push({
              label: `${ item.ownerName }（${ item[searchKey] }）`,
              value: `${ item[searchKey] }`
            });
          }
        }
      } else if (/^[a-zA-Z\s]+$/i.test(value)) {
        // 搜索英文
        // 搜索ID
        const regexp: RegExp = new RegExp(value.replaceAll(' ', ''), 'i');

        for (const item of roomId) {
          if (item.pinyin && regexp.test(`${ item.pinyin.replaceAll(' ', '') }`)) {
            result.push({
              label: `${ item.ownerName }（${ item[searchKey] }）`,
              value: `${ item[searchKey] }`
            });
          }
        }
      }

      setUserIdSearchResult(result);
      setUserIdSearchLoading(false);
    }, 500);
  }

  return (
    <div className="relative inline-block align-super">
      <AutoComplete className={ style.w250 }
        value={ formValue }
        placeholder="搜索支持姓名、ID、拼音"
        onSearch={ handleByContentSearch }
        options={ userIdSearchResult }
        onChange={ handleChange }
      />
      <div className="absolute z-10 top-[4px] right-[6px] pointer-events-none">
        { userIdSearchLoading && <Spin size="small" indicator={ <IconLoadingOutlined spin={ true } /> } /> }
      </div>
    </div>
  );
}

function userInfoSearch({ root, form, required }: CustomComponentFuncArgs<StringItem>): ReactElement {
  return <UserInfoSearchComponent form={ form } root={ root } />;
}

export default userInfoSearch;