# QQ群工具

## 许可证
本软件遵循**GNU General Public License v3.0**许可证。

## 技术栈
html5 + less + TypeScript + react + antd + webpack + nwjs。

## 编译命令
* 输入命令 `$ npm start` 运行开发环境。
* 输入命令 `$ npm build` 编译到文件夹。
* 输入命令 `$ npm run devdll` 编译开发环境dll文件。
* 输入命令 `$ npm run prodll` 编译生产环境编译dll文件。
* 输入命令 `$ npm run proinstall` 安装生产环境依赖。

## nwjs中文文档
[https://wizardforcel.gitbooks.io/nwjs-doc/content/wiki/index.html](https://wizardforcel.gitbooks.io/nwjs-doc/content/wiki/index.html)

## 谷歌扩展
* 教程参考：[http://www.ituring.com.cn/book/1421](http://www.ituring.com.cn/book/1421)
* api文档：[https://developer.chrome.com/extensions/api_index](https://developer.chrome.com/extensions/api_index)

## 文件夹结构
* nwjs: nwjs SDK
  * app: 源代码

## 关于dll
无论是开发环境还是生产环境，首先要编译dll文件，将公共模块提取出来。

## 打包方法
* 将文件夹内的文件打包成压缩文件，并重命名为*.nw
* 将*.nw复制到和nw.exe同级目录下，运行
```
$ copy /b nw.exe+*.nw *.exe
```

## 源代码托管地址
[https://github.com/duan602728596/qqtools](https://github.com/duan602728596/qqtools)