
## 运行
* `git clone project`
* `npm i`
* `npm run debug`               启动无缓存Http服务+实时编译
* 
* 
* **其他命令**
* `npm run httpserver`          启动带有缓存的Http服务
* `npm run httpserver-nocache`  启动无缓存Http服务
* `npm run build`               启动实时编译项目至dist目录+保存自动编译


---

## 调试(可选)
* VSCode安装Chrome调试插件
  搜索插件 `Debugger for Chrome` 并安装
* 默认配置，项目的`.vscode` 目录已增加 `launch.json` 
* `F5` 开始调试，可以在VSCode中打断点、查看变量。


---


## 默认配置
* 默认web端口8080



## 其他npm包

* axios		调用webapi

* signals(@types/signals)	事件订阅/通知    