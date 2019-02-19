import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { createSelector, createStructuredSelector } from 'reselect';
import style from './style.sass';
import { getMemberInformation, addMemberInformation } from '../store/reducer';
import { requestMemberInformation } from '../../../components/kd48listerer/roomListener';

/* 初始化数据 */
const state: Function = createStructuredSelector({});

/* dispatch */
const dispatch: Function = (dispatch: Function): Object => ({
  action: bindActionCreators({
    getMemberInformation,
    addMemberInformation
  }, dispatch)
});

@connect(state, dispatch)
class MemberInformation extends Component {
  constructor(): void {
    super(...arguments);

    this.state = {
      memberName: null, // 成员姓名
      roomId: null // 房间姓名
    };
  }
  async componentDidMount(): Promise<void> {
    try {
      const memberId: number = this.props.item.memberId;
      const infor: Object = await this.props.action.getMemberInformation({
        query: memberId
      });

      if (infor.result !== undefined) {
        // 从数据库查找缓存
        this.setState({
          memberName: infor.result.memberName,
          roomId: infor.result.roomId
        });
      } else {
        // 从接口获取数据
        const data: Object = await requestMemberInformation(memberId);
        let roomInfo: Object = data.content.roomInfo;

        // 兼容
        if (!(roomInfo && ('memberName' in roomInfo) && ('roomId' in roomInfo))) {
          roomInfo = {};
          roomInfo.memberName = '';
          roomInfo.roomId = '';
        }

        const { memberName, roomId }: {
          memberName: string,
          roomId: string
        } = roomInfo;
        const memberName2: string = memberName.replace(/\s/g, '');
        const value2: Object = {
          memberId,
          memberName: memberName2,
          roomId
        };

        await this.props.action.addMemberInformation({
          data: value2
        });
        this.setState({
          memberName: memberName2,
          roomId
        });
      }
    } catch (err) {
      console.error(err);
    }
  }
  render(): ?(Array | Object) {
    if (this.state.memberName !== null && this.state.roomId !== null) {
      if (this.state.memberName !== '' && this.state.roomId !== '') {
        return [
          <b key="0" className={ style.keyName }>memberName:</b>,
          <span key="1" className={ style.mr20 }>{ this.state.memberName }</span>,
          <b key="2" className={ style.keyName }>roomId:</b>,
          <span key="3">{ this.state.roomId }</span>
        ];
      } else {
        return null;
      }
    } else {
      return (
        <span className={ style.loadingText }>加载中...</span>
      );
    }
  }
}

export default MemberInformation;