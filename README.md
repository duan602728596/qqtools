# qqtools-mirai

基于mirai和mirai-api-http使用的机器人客户端

## 配置说明

### 端口号和authKey的配置

参考[https://github.com/project-mirai/mirai-api-http](https://github.com/project-mirai/mirai-api-http)

### 口袋监听配置

在公演网站（ 比如[https://live.48.cn/Index/invideo/club/2/id/3730](https://live.48.cn/Index/invideo/club/2/id/3730) ），   
登陆口袋48账号，在开发者工具内找到`do_ajax_setcookie`地址，返回的结果内包含account。   

`pocketroom` 命令输出口袋房间当前的xox。

### 微博配置

微博地址（ 比如[https://weibo.com/u/5891500145](https://weibo.com/u/5891500145) ），后面的数字即为uid。

### b站直播配置

直播间地址（ 比如[https://live.bilibili.com/11588230](https://live.bilibili.com/11588230) ），后面的数字即为直播间id。

### 桃叭集资配置

`taoba`、`桃叭`、`jizi`、`jz`、`集资` 命令输出集资链接。   
`排行榜`、`phb` 命令输出排行榜信息。   
桃叭集资配置的模板除了支持占位符，还支持`{{ var }}`渲染。var表示注入的变量。   
模板的功能参考[nunjucks](https://mozilla.github.io/nunjucks/cn/templating.html)。

* 集资命令模板变量
  * title: 标题
  * taobaid: 桃叭id

> 由于桃叭关闭了订单接口，集资监听功能已移除，集资结果已不可用。

<!--

* 集资结果模板: 
  * nickname: 集资人的昵称
  * title: 标题
  * money: 集资金额
  * taobaid: 桃叭id
  * donation: 当前集资进度
  * amount: 集资总进度
  * amountdifference: 相差金额
  * juser: 参与集资的人数
  * expire: 项目截止时间
  * timedifference: 距离项目截止的时间
  * otherTaobaDetails: 其他集资信息（配置了多个ID时为数组类型，否则为undefined）
    * title: 标题
    * donation: 已集资金额
    * amount: 集资总金额
  * rankIndex: 当开启**结果包含排行榜**配置时，集资结果模板内可以输出当前集资人的排名（索引从0开始）
  * taobaRankList: 当开启**结果包含排行榜**配置时，集资结果模板内可以输出排行榜的信息（数组类型）
    * nick: 集资人的昵称
    * money: 集资金额
    
其他集资信息的配置使用小写逗号`,`分隔。其他集资信息在模版上可以这样显示：

```
段艺璇：{{ otherTaobaDetails[0].donation }}
谢蕾蕾：{{ otherTaobaDetails[1].donation }}
张怀瑾：{{ otherTaobaDetails[2].donation }}
```

* 当开启**结果包含排行榜**配置时，集资结果模板内可以输出当前集资人的排名和排行榜信息，排行榜使用如下的方式渲染：

```
...集资信息
------ 排行榜 ------
{% for item in taobaRankList -%}
{% if loop.index !== 1 -%}{{ '\n' }}{%- endif %}{{ loop.index }}、{{ item.nick }}：{{ item.money }}
{%- endfor %}
------ 排行榜 ------
...集资信息
```

`loop.index`代表了当前索引（从1开始）。   
也可以只渲染前几名，比如前6名可以这样展示（使用js的Array.prototype.slice方法截取数组）：

```
...集资信息
------ 排行榜 ------
{% for item in taobaRankList.slice(0, 5) -%}
{% if loop.index !== 1 -%}{{ '\n' }}{%- endif %}{{ loop.index }}、{{ item.nick }}：{{ item.money }}
{%- endfor %}
------ 排行榜 ------
...集资信息
```

-->

### 定时消息配置

执行时间的配置查看文档[https://github.com/kelektiv/node-cron#cron-ranges](https://github.com/kelektiv/node-cron#cron-ranges)

## 群欢迎、定时消息、自定义命令的发送模板配置

群欢迎和自定义命令配置支持在文字中写入占位符来支持某种功能

### 占位符：

* `<%= qqtools:Image, 图片地址 %>`：图片占位
* `<%= qqtools:At %>`：At单个成员，如果填写QQ号则At指定成员，`<%= qqtools:At, 123456 %>`
* `<%= qqtools:AtAll %>`：At全体成员
  
如果我想配置群欢迎信息，可以这样配置。会自动获取成员的QQ号填入模板中：

```
<%= qqtools:At %>欢迎加入xxx应援会。
```

### 输出软件信息

`log`命令可以输出软件信息。

## mirai登陆

mirai的登陆功能从mirai-login整合进来。包括记住密码、自动登陆、一键登陆等功能。

### jar文件夹和java文件的配置

使用mirai，需要下载`mirai-console-{version}-all.jar`、`mirai-console-terminal-{version}-all.jar`、   
`mirai-core-all-{version}-all.jar`文件。需要下载`mirai-api-http-v{version}.mirai.jar`插件。   

mirai依赖java环境，所以你也需要下载java。java文件配置要选择bin目录下文件名为`java`的文件。   

将mirai的三个文件放到content目录下。jar文件夹配置选择这个content目录，启动后会在content目录同级生成plugins等文件夹，放入相关插件。

## 许可证

本软件遵循**GNU Affero General Public License v3.0**许可证。

## 技术栈

Pug + Sass + TypeScript + React + antd + Webpack + Electron。

## 模块

* qqtools: 软件源代码
* app：编译程序主目录
* main：Electron主程序运行源代码

## 如何编译

1. main模块：进入`packages/main`，运行`npm run build`，编译主程序源代码
2. qqtools模块：进入`packages/qqtools`，运行`npm run build`，编译软件源代码
3. 运行`node scripts/unpack.js`，打包软件
4. 运行`node scripts/clean.js`，删除软件中的无用的文件

## 源代码托管地址

[https://github.com/duan602728596/qqtools](https://github.com/duan602728596/qqtools)

![](flower.gif)