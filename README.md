# qqtools3

基于mirai和mirai-api-http使用的机器人客户端

## 配置说明

### 端口号和authKey的配置

参考[https://github.com/project-mirai/mirai-api-http](https://github.com/project-mirai/mirai-api-http)

### 口袋监听配置

在公演网站（ 比如[https://live.48.cn/Index/invideo/club/2/id/3730](https://live.48.cn/Index/invideo/club/2/id/3730) ），登陆口袋48账号，在开发者工具内找到`do_ajax_setcookie`地址，返回的结果内包含account

### 微博配置

微博地址（ 比如[https://weibo.com/u/5891500145](https://weibo.com/u/5891500145) ），后面的数字即为uid

### b站直播配置

直播间地址（ 比如[https://live.bilibili.com/11588230](https://live.bilibili.com/11588230) ），后面的数字即为直播间id

### 群欢迎和自定义命令配置

* 群的欢迎消息和自定义命令的消息必须配置json格式的字符串，json类型必须是数组（虽然不友好，但是实在是懒得写这个地方的交互）
* 数组内的对象是以下格式：
  * `{ "type": "Plain", "text": "" }` 发送文字
  * `{ "type": "Image", "url": "" }` 发送图片
  * `{ "type": "At", "target": 123456, "display": "name" }` 圈一个人。target是qq号
  * `{ "type": "AtAll", target: 0 }` 圈所有人
* 比如群欢迎可以这样配置：`[{ "type": "At" }, { "type": "Plain", "text": "欢迎新成员" }]`，会自动为at类型添加新入群成员的qq号

## 如何编译

1. 编译@qqtools3/main、@qqtools3/qqtools项目
2. 运行scripts文件夹内的脚本打包软件