/* 当前配置的具体内容 */
import React, { Component } from 'react';
import classNames from 'classnames';
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
    return custom.map((item: Object, index: number): React.Element=>{
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

const Detail: ?Object = (props: ?Object): ?React.Element=>{
  if(!props.detail){
    return null;
  }

  const { detail }: { detail: Object } = props;
  return (
    <table className={ style.detail }>
      <tbody>
        {/* 基础 */}
        <tr>
          <td className={ classNames(style.td1, style.tdTitle) }>配置名称</td>
          <td className={ style.td2 }>{ detail.name }</td>
          <td className={ classNames(style.td1, style.tdTitle) }>QQ号</td>
          <td className={ style.td2 }>{ detail.qqNumber }</td>
        </tr>
        <tr>
          <td className={ classNames(style.td1, style.tdTitle) }>群号</td>
          <td className={ style.td2 }>{ detail.groupNumber }</td>
          <td className={ classNames(style.td1, style.tdTitle) }>socket端口</td>
          <td className={ style.td2 }>{ detail.socketPort }</td>
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
          <td className={ style.tdTitle }>开启排行榜查询</td>
          <td>
            {
              detail.basic.isModianLeaderboard ? (
                <span className={ style.on }>开启</span>
              ) : (
                <span className={ style.off }>未开启</span>
              )
            }
          </td>
        </tr>
        <tr>
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
        {/* 抽卡 */}
        <tr>
          <td className={ style.tdGTitle } colSpan={ 4 }>摩点抽卡配置：</td>
        </tr>
        <tr>
          <td className={ style.tdTitle }>开启摩点抽卡功能</td>
          <td>
            {
              detail.basic.isChouka ? (
                <span className={ style.on }>开启</span>
              ) : (
                <span className={ style.off }>未开启</span>
              )
            }
          </td>
          <td className={ style.tdTitle }>发送图片</td>
          <td>
            {
              detail.basic.isChoukaSendImage ? (
                <span className={ style.on }>开启</span>
              ) : (
                <span className={ style.off }>未开启</span>
              )
            }
          </td>
        </tr>
        <tr>
          <td className={ style.tdTitle }>卡牌信息文件地址</td>
          <td colSpan={ 3 }>
            <pre>{ detail.basic.choukaJson }</pre>
          </td>
        </tr>
        <tr>
          <td className={ style.tdTitle }>允许补卡的QQ号</td>
          <td colSpan={ 3 }>
            <pre>{ detail.basic.bukaQQNumber }</pre>
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
        <tr>
          <td className={ style.tdTitle }>发送图片和图片链接（只限于酷QPro版本）</td>
          <td>
            {
              detail.basic.isRoomSendImage ? (
                <span className={ style.on }>开启</span>
              ) : (
                <span className={ style.off }>未开启</span>
              )
            }
          </td>
          <td className={ style.tdTitle }>监听间隔（秒）</td>
          <td>{ detail.basic.liveListeningInterval }</td>
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
        {/* 欢迎新成员 */}
        <tr>
          <td className={ style.tdGTitle } colSpan={ 4 }>欢迎新成员</td>
        </tr>
        <tr>
          <td className={ style.tdTitle }>开启欢迎新成员功能</td>
          <td>
            {
              detail.basic.isNewGroupMember ? (
                <span className={ style.on }>开启</span>
              ) : (
                <span className={ style.off }>未开启</span>
              )
            }
          </td>
        </tr>
        <tr>
          <td className={ style.tdTitle }>欢迎词</td>
          <td colSpan={ 3 }>
            <pre>{ detail.basic.welcomeNewGroupMember }</pre>
          </td>
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
        {/* 群内帮助命令 */}
        <tr>
          <td className={ style.tdGTitle } colSpan={ 4 }>帮助：</td>
        </tr>
        <tr>
          <td className={ style.tdTitle }>群内帮助命令</td>
          <td colSpan={ 3 }>
            {
              detail.basic.isHelpCommend ? (
                <span className={ style.on }>开启</span>
              ) : (
                <span className={ style.off }>未开启</span>
              )
            }
          </td>
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