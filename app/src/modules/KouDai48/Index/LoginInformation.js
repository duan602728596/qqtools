import React from 'react';
import { Card } from 'antd';
import style from './style.sass';

const LoginInformation: Function = (props: Object): Array | Object=>{
  const item: ?Object = props.loginInformation;
  return (
    <Card title="登录信息">
      {
        item ? [
          <p key={ 0 } className={ style.mb10 }>ID:&nbsp;{ item.userInfo.userId }</p>,
          <p key={ 1 } className={ style.mb10 }>昵称:&nbsp;{ item.userInfo.nickName }</p>,
          <p key={ 2 } className={ style.mb10 }>Token:&nbsp;{ item.token }</p>
        ] : (
          <p>暂无登录记录</p>
        )
      }
    </Card>
  );
};

export default LoginInformation;