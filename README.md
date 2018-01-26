# 口袋48房间留言抓取接口

## 登录接口
* url: https://puser.48.cn/usersystem/api/user/v1/login/phone
* method: POST
* headers:
  * os: android
  * IMEI: 864394020501237
  * version: 5.0.0
  * Content-Type: application/json
  * Connection: Keep-Alive
* body:
  * password: 密码
  * account: 账号
  * longitude: 0
  * latitude: 0

## 图片地址
* url: https://source3.48.cn/mediasource/badge/small/sljj_1_s.png
* method: get

## 小偶像信息
* url: https://puser.48.cn/usersystem/api/user/member/v1/fans/room
* method: POST
* headers:
  * os: android
  * IMEI: 864394020501237
  * version: 5.0.0
  * Content-Type: application/json
  * Connection: Keep-Alive
  * <del>token: 登录后获得的token</del>
* body:
  * memberId: 成员Id（测试：417331，GNZ48-杨媛媛）

## 房间信息
* url: https://pjuju.48.cn/imsystem/api/im/v1/member/room/message/mainpage
* method: POST
* headers:
  * os: android
  * IMEI: 864394020501237
  * version: 5.0.0
  * Content-Type: application/json
  * Connection: Keep-Alive
  * token: 登录后获得的token
* body:
  * roomId: 房间id
  * chatType: 0
  * lastTime: 0
  * limit: 返回数据

## 聚聚信息
* url: https://puser.48.cn/usersystem/api/user/v1/show/info/:id
* method: POST
* headers:
  * os: android
  * IMEI: 864394020501237
  * version: 5.0.0
  * Content-Type: application/json
  * Connection: Keep-Alive
  * <del>token: 登录后获得的token</del>
* body:
  * needRecommend: false
  * needChatInfo: false
  * needFriendsNum: false
