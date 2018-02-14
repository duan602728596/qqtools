# QQ群工具

## 软件下载链接
进入到[https://github.com/duan602728596/document/blob/master/48/README.md](https://github.com/duan602728596/document/blob/master/48/README.md)下载

## 针对酷Q的扩展
针对酷Q的扩展请查看[https://github.com/duan602728596/qqtools/tree/master](https://github.com/duan602728596/qqtools/tree/master)

## 功能
* 摩点项目监听
* 口袋48直播监听
* 成员房间信息监听
* 微博监听
* 定时喊话
* 天气预报查询
* 图灵机器人
* 自定义命令
* 配置导入和导出

## 许可证
本软件遵循**GNU General Public License v3.0**许可证。

## 技术栈
pug + sass + ECMA8 + react + antd + webpack + nwjs。  

## 编译命令
* 输入命令 `$ npm start` 运行开发环境。
* 输入命令 `$ npm build` 编译到文件夹。
* 输入命令 `$ npm run devdll` 编译开发环境dll文件。
* 输入命令 `$ npm run prodll` 编译生产环境编译dll文件。
* 输入命令 `$ npm run npmi` 或 `$ yarn run yarni` 安装生产环境依赖。

## nwjs中文文档
[https://wizardforcel.gitbooks.io/nwjs-doc/content/wiki/index.html](https://wizardforcel.gitbooks.io/nwjs-doc/content/wiki/index.html)

## 谷歌扩展
* 教程参考：[http://www.ituring.com.cn/book/1421](http://www.ituring.com.cn/book/1421)
* api文档：[https://developer.chrome.com/extensions/api_index](https://developer.chrome.com/extensions/api_index)

## 文件夹结构
* nwjs: nwjs SDK
  * app: 源代码
  * .cache: 缓存目录

## 关于dll
无论是开发环境还是生产环境，首先要编译dll文件，将公共模块提取出来。

## 关于node-sass
node-sass如果安装失败，可以先到[https://github.com/sass/node-sass/releases](https://github.com/sass/node-sass/releases)下载binding.node文件，然后将该文件添加到SASS_BINARY_PATH环境变量内。

## 打包方法
* 将文件夹内的文件打包成压缩文件，并重命名为*.nw
* 将*.nw复制到和nw.exe同级目录下，运行
```
$ copy /b nw.exe+*.nw *.exe
```

## 源代码托管地址
[https://github.com/duan602728596/qqtools](https://github.com/duan602728596/qqtools)