// @flow
/* 当前配置的具体内容 */
import React, { Component } from 'react';
import jQuery from 'jquery';
import style from './style.sass';

/* 将Obj转换成Array */
function customProfiles(customProfiles: Object): Array{
  const custom: { command: string, text: string }[] = [];
  jQuery.each(customProfiles, (key: string, value: string): void=>{
    custom.push({
      command: key,
      text: value
    });
  });
  if(custom.length === 0){
    return (
      <tr>
        <td colSpan={ 4 }>无自定义命令</td>
      </tr>
    );
  }else{
    return custom.map((item: Object, index: number): Object=>{
      return (
        <tr key={ item.command }>
          <td>{ item.command }</td>
          <td colSpan={ 3 }>
            <pre>{ item.text }</pre>
          </td>
        </tr>
      );
    });
  }
}

const Detail: ?Object = (props: ?Object): ?Object=>{
  if(!props.detail){
    return null;
  }

  const { detail }: { detail: Object } = props;
  return (
    <table className={ style.detail }>
      <tbody>
        {/* 基础 */}
        <tr>
          <td className={ `${ style.td1 } ${ style.tdTitle }` }>配置名称</td>
          <td className={ style.td2 }>{ detail.name }</td>
          <td className={ `${ style.td1 } ${ style.tdTitle }` }>监视群名称</td>
          <td className={ style.td2 }>{ detail.groupName }</td>
        </tr>
        {/* 微打赏 */}
        <tr>
          <td className={ style.tdGTitle } colSpan={ 4 }>微打赏配置：</td>
        </tr>
        <tr>
          <td className={ style.tdTitle }>开启微打赏功能</td>
          <td>
            {
              detail.basic.isWds ? (
                <span className={ style.on }>开启</span>
              ) : (
                <span className={ style.off }>未开启</span>
              )
            }
          </td>
          <td className={ style.tdTitle }>微打赏ID</td>
          <td>{ detail.basic.wdsId }</td>
        </tr>
        <tr>
          <td className={ style.tdTitle }>微打赏命令</td>
          <td colSpan={ 3 }>
            <pre>{ detail.basic.wdsUrlTemplate }</pre>
          </td>
        </tr>
        <tr>
          <td className={ style.tdTitle }>微打赏模板</td>
          <td colSpan={ 3 }>
            <pre>{ detail.basic.wdsTemplate }</pre>
          </td>
        </tr>
        {/* 直播监听 */}
        <tr>
          <td className={ style.tdGTitle } colSpan={ 4 }>直播监听</td>
        </tr>
        <tr>
          <td className={ style.tdTitle }>开启口袋48直播监听功能</td>
          <td>
            {
              detail.basic.is48LiveListener ? (
                <span className={ style.on }>开启</span>
              ) : (
                <span className={ style.off }>未开启</span>
              )
            }</td>
        </tr>
        <tr>
          <td className={ style.tdTitle }>监听成员</td>
          <td colSpan={ 3 }>
            <pre>{ detail.basic.kd48LiveListenerMembers }</pre>
          </td>
        </tr>
        {/* 新成员欢迎 */}
        <tr>
          <td className={ style.tdGTitle } colSpan={ 4 }>开启新成员欢迎功能</td>
        </tr>
        <tr>
          <td className={ style.tdTitle }>开启微打赏功能</td>
          <td>
            {
              detail.basic.isNewBlood ? (
                <span className={ style.on }>开启</span>
              ) : (
                <span className={ style.off }>未开启</span>
              )
            }
          </td>
        </tr>
        <tr>
          <td className={ style.tdTitle }>欢迎语模板</td>
          <td colSpan={ 3 }>
            <pre>{ detail.basic.newBloodTemplate }</pre>
          </td>
        </tr>
        {/* 心知天气 */}
        <tr>
          <td className={ style.tdGTitle } colSpan={ 4 }>心知天气</td>
        </tr>
        <tr>
          <td className={ style.tdTitle }>开启心知天气的查询天气功能</td>
          <td>
            {
              detail.basic.isXinZhiTianQi ? (
                <span className={ style.on }>开启</span>
              ) : (
                <span className={ style.off }>未开启</span>
              )
            }
          </td>
          <td className={ style.tdTitle }>心知天气APIKey</td>
          <td>{ detail.basic.xinZhiTianQiAPIKey }</td>
        </tr>
        <tr>
          <td className={ style.tdTitle }>天气情况模板</td>
          <td colSpan={ 3 }>
            <pre>{ detail.basic.xinZhiTianQiTemplate }</pre>
          </td>
        </tr>
        {/* 图灵机器人 */}
        <tr>
          <td className={ style.tdGTitle } colSpan={ 4 }>图灵机器人</td>
        </tr>
        <tr>
          <td className={ style.tdTitle }>开启图灵机器人功能</td>
          <td>
            {
              detail.basic.isTuLing ? (
                <span className={ style.on }>开启</span>
              ) : (
                <span className={ style.off }>未开启</span>
              )
            }
          </td>
          <td className={ style.tdTitle }>图灵机器人APIKey</td>
          <td>{ detail.basic.tuLingAPIKey }</td>
        </tr>
        {/* 自定义命令 */}
        <tr>
          <td className={ style.tdGTitle } colSpan={ 4 }>自定义命令</td>
        </tr>
        { customProfiles(detail.custom) }
      </tbody>
    </table>
  );
};

export default Detail;