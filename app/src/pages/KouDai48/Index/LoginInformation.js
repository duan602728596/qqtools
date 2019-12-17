import React from 'react';
import { Card } from 'antd';
import style from './style.sass';

function LoginInformation(props) {
  const item = props.loginInformation;

  return (
    <Card title="登录信息">
      {
        do{
          if (item) {
            [
              <p key="0" className={ style.inforP }>ID:&nbsp;{ item?.userInfo?.userId }</p>,
              <p key="1" className={ style.inforP }>昵称:&nbsp;{ item?.userInfo?.nickname }</p>,
              <p key="2" className={ style.inforP }>Token:&nbsp;{ item?.token }</p>
            ];
          } else {
            <p>暂无登录记录</p>;
          }
        }
      }
    </Card>
  );
}

export default LoginInformation;