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

### 定时消息配置

执行时间的配置查看文档[https://github.com/kelektiv/node-cron#cron-ranges](https://github.com/kelektiv/node-cron#cron-ranges)

## 群欢迎、定时消息、自定义命令的发送模板配置

群欢迎和自定义命令配置支持在文字中写入占位符来支持某种功能

### 占位符：

* `<%= qqtools:Image, 图片地址 %>`：图片占位
* `<%= qqtools:At %>`：At单个成员，如果填写QQ号则At指定成员，`<%= qqtools:At, 123456 %>`
* `<%= qqtools:AtAll %>`：At全体成员
  
如果我想配置群欢迎信息，可以这样配置。会自动获取成员的QQ号填如模板中：

```
<%= qqtools:At %>欢迎加入xxx应援会。
```

## 如何编译

1. 编译@qqtools3/main、@qqtools3/qqtools项目
2. 运行scripts文件夹内的脚本打包软件