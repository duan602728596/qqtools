/* 当前配置的具体内容 */
import React, { Component } from 'react';
import $ from 'jquery';
import style from './style.sass';

/* 将Obj转换成Array */
function customProfiles(customProfiles: Object): Array{
  const custom: { command: string, text: string }[] = [];
  $.each(customProfiles, (key: string, value: string): void=>{
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
        {/* 摩点 */}
        <tr>
          <td className={ style.tdGTitle } colSpan={ 4 }>摩点项目配置：</td>
        </tr>
        <tr>
          <td className={ style.tdTitle }>开启摩点项目监听功能</td>
          <td>
            {
              detail.basic.isModian ? (
                <span className={ style.on }>开启</span>
              ) : (
                <span className={ style.off }>未开启</span>
              )
            }
          </td>
          <td className={ style.tdTitle }>摩点项目ID</td>
          <td>{ detail.basic.modianId }</td>
        </tr>
        <tr>
          <td className={ style.tdTitle }>摩点项目命令</td>
          <td colSpan={ 3 }>
            <pre>{ detail.basic.modianUrlTemplate }</pre>
          </td>
        </tr>
        <tr>
          <td className={ style.tdTitle }>摩点项目模板</td>
          <td colSpan={ 3 }>
            <pre>{ detail.basic.modianTemplate }</pre>
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
            }
          </td>
        </tr>
        <tr>
          <td className={ style.tdTitle }>监听成员</td>
          <td colSpan={ 3 }>
            <pre>{ detail.basic.kd48LiveListenerMembers }</pre>
          </td>
        </tr>
        {/* 成员房间信息监听 */}
        <tr>
          <td className={ style.tdGTitle } colSpan={ 4 }>成员房间信息监听</td>
        </tr>
        <tr>
          <td className={ style.tdTitle }>开启成员房间信息监听功能</td>
          <td>
            {
              detail.basic.isRoomListener ? (
                <span className={ style.on }>开启</span>
              ) : (
                <span className={ style.off }>未开启</span>
              )
            }
          </td>
          <td className={ style.tdTitle }>房间ID</td>
          <td>{ detail.basic.roomId }</td>
        </tr>
        {/* 微博监听 */}
        <tr>
          <td className={ style.tdGTitle } colSpan={ 4 }>微博监听</td>
        </tr>
        <tr>
          <td className={ style.tdTitle }>开启微博监听功能</td>
          <td>
            {
              detail.basic.isWeiboListener ? (
                <span className={ style.on }>开启</span>
              ) : (
                <span className={ style.off }>未开启</span>
              )
            }
          </td>
          <td className={ style.tdTitle }>微博lfid</td>
          <td>{ detail.basic.lfid }</td>
        </tr>
        {/* 群内定时消息推送功能 */}
        <tr>
          <td className={ style.tdGTitle } colSpan={ 4 }>群内定时消息推送功能</td>
        </tr>
        <tr>
          <td className={ style.tdTitle }>开启群内定时消息推送功能</td>
          <td>
            {
              detail.basic.isTimingMessagePush ? (
                <span className={ style.on }>开启</span>
              ) : (
                <span className={ style.off }>未开启</span>
              )
            }
          </td>
          <td className={ style.tdTitle }>规则配置</td>
          <td>{ detail.basic.timingMessagePushFormat }</td>
        </tr>
        <tr>
          <td className={ style.tdTitle }>推送消息</td>
          <td colSpan={ 3 }>
            <pre>{ detail.basic.timingMessagePushText }</pre>
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