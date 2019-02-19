/**
 * 口袋48成员房间信息监听配置
 *
 * @flow
 */
import * as React from 'react';
import { Component } from 'react';
import PropTypes from 'prop-types';
import { Card, Checkbox, Form, Input, InputNumber } from 'antd';
import style from '../style.sass';
import * as ShuoMing from '../utils/shuoming';

class Koudai48RoomListener extends Component<{ form: Object, detail: Object }> {
  static propTypes: Object = {
    form: PropTypes.object,
    detail: PropTypes.object
  };

  render(): React.Node {
    const { detail, form }: { detail: ?Object, form: Object } = this.props;
    const { getFieldDecorator }: { getFieldDecorator: Function } = form;
    const colsArea2: Object = { labelCol: { span: 6 }, wrapperCol: { span: 18 } };

    const isRoomListener: boolean = detail?.basic?.isRoomListener || false; // 房间监听
    const isRoomSendImage: boolean = detail?.basic?.isRoomSendImage || false; // 房间信息发送图片和链接
    const isRoomSendRecord: boolean = detail?.basic?.isRoomSendRecord || false; // 房间信息发送语音

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
                  validator: (rule: Object, value: number, callback: Function): void => {
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