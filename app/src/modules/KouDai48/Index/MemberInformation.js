import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { createSelector, createStructuredSelector } from 'reselect';
import style from './style.sass';
import { getMemberInformation, addMemberInformation } from '../store/reducer';

/* 初始化数据 */
const state = createStructuredSelector({});

/* dispatch */
const dispatch = (dispatch) => ({
  action: bindActionCreators({
    getMemberInformation,
    addMemberInformation
  }, dispatch)
});

@connect(state, dispatch)
class MemberInformation extends Component {
  static propTypes = {
    item: PropTypes.object,
    roomPage: PropTypes.array
  };

  // 根据id搜索房间id
  findRoomIdByMemberId(memberId) {
    const { roomPage = [] } = this.props;
    let id = null;
    let name = null;

    for (const item of roomPage) {
      if (memberId === Number(item.ownerId)) {
        id = item.targetId;
        name = item.ownerName;
        break;
      }
    }

    return { id, name };
  }

  render() {
    const { item } = this.props;
    const { name, id } = this.findRoomIdByMemberId(Number(item.memberId));

    if (item) {
      if (name !== '') {
        return [
          <b key="0" className={ style.keyName }>memberName:</b>,
          <span key="1" className={ style.mr20 }>{ name || '---' }</span>,
          <b key="2" className={ style.keyName }>roomId:</b>,
          <span key="3">{ id || '---' }</span>
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