/**
 * 口袋48成员房间信息监听配置
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Card, Checkbox, Form, Input, InputNumber } from 'antd';
import style from '../style.sass';
import * as ShuoMing from '../utils/shuoming';

class Koudai48RoomListener extends Component {
  static propTypes = {
    form: PropTypes.object,
    detail: PropTypes.object
  };

  render() {
    const { detail, form } = this.props;
    const { getFieldDecorator } = form;
    const colsArea2 = { labelCol: { span: 6 }, wrapperCol: { span: 18 } };
    const isFlipAnswerSend = detail?.basic?.isFlipAnswerSend || false; // 发送翻牌信息
    const isRoomListener = detail?.basic?.isRoomListener || false; // 房间监听
    const isRoomSendImage = detail?.basic?.isRoomSendImage || false; // 房间信息发送图片和链接
    const isRoomSendRecord = detail?.basic?.isRoomSendRecord || false; // 房间信息发送语音

    return (
      <Card className={ style.mb10 } title="成员房间信息监听配置" extra="如果未登录，无法监听成员房间信息。">
        <Form.Item label="开启成员房间信息监听" { ...colsArea2 }>
          {
            getFieldDecorator('isRoomListener', {
              initialValue: isRoomListener
            })(<Checkbox defaultChecked={ isRoomListener } />)
          }
        </Form.Item>
        <Form.Item label="房间ID" { ...colsArea2 }>
          {
            getFieldDecorator('roomId', {
              initialValue: detail ? detail.basic.roomId : ''
            })(<Input />)
          }
        </Form.Item>
        <Form.Item label="成员ID" { ...colsArea2 }>
          {
            getFieldDecorator('ownerId', {
              initialValue: detail ? detail.basic.ownerId : ''
            })(<Input />)
          }
          <ShuoMing.Kd48RoomListener />
        </Form.Item>
        <Form.Item label="发送翻牌信息" { ...colsArea2 }>
          {
            getFieldDecorator('isFlipAnswerSend', {
              initialValue: isFlipAnswerSend
            })(<Checkbox defaultChecked={ isFlipAnswerSend } />)
          }
          <ShuoMing.IsRoomSendImage />
        </Form.Item>
        <Form.Item label="发送图片" { ...colsArea2 }>
          {
            getFieldDecorator('isRoomSendImage', {
              initialValue: isRoomSendImage
            })(<Checkbox defaultChecked={ isRoomSendImage } />)
          }
          <ShuoMing.IsRoomSendImage />
        </Form.Item>
        <Form.Item label="发送语音" { ...colsArea2 }>
          {
            getFieldDecorator('isRoomSendRecord', {
              initialValue: isRoomSendRecord
            })(<Checkbox defaultChecked={ isRoomSendRecord } />)
          }
          <ShuoMing.IsRoomSendImage />
        </Form.Item>
        <Form.Item label="监听间隔（秒）" { ...colsArea2 }>
          {
            getFieldDecorator('liveListeningInterval', {
              initialValue: detail ? detail.basic.liveListeningInterval : 15,
              rules: [
                {
                  message: '必须输入监听间隔',
                  required: true
                },
                {
                  validator: (rule, value, callback) => {
                    if (value < 15) {
                      callback(rule.message);
                    } else {
                      callback();
                    }
                  },
                  message: '监听间隔必须大于15秒'
                }
              ]
            })(<InputNumber />)
          }
        </Form.Item>
      </Card>
    );
  }
}

export default Koudai48RoomListener;