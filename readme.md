
## 说明
PlaneWallGenerator 是一个使用2D数据来生成3D墙体数据的工具。
根据提供的2D锚点坐标和连接锚点的线进行每面墙体的生成 如下图所示，可以单独设置每面墙体的厚度。

## 原理
![avatar](/documents/readme.png)


## DEMO 

``` typescript
        var anchors: { [key: number]: Anchor } = {};
        anchors[0] = new Anchor(0, 100, 100);
        anchors[1] = new Anchor(1, 200, 100);
        anchors[2] = new Anchor(2, 400, 100);
        anchors[3] = new Anchor(3, 200, 200);
        anchors[4] = new Anchor(4, 100, 300);
        anchors[5] = new Anchor(5, 150, 350);
        anchors[6] = new Anchor(6, 200, 300);
        anchors[7] = new Anchor(7, 270, 350);
        anchors[8] = new Anchor(8, 400, 250);
        anchors[9] = new Anchor(9, 180, 200);
        anchors[10] = new Anchor(10, 220, 200);
        anchors[11] = new Anchor(11, 300, 200);

        var smgents: Segment[] = [];
        smgents.push(new Segment(anchors[0], anchors[1], 20));
        smgents.push(new Segment(anchors[0], anchors[4], 20));
        smgents.push(new Segment(anchors[1], anchors[3], 20));
        smgents.push(new Segment(anchors[2], anchors[1], 40));
        smgents.push(new Segment(anchors[4], anchors[5], 20));
        smgents.push(new Segment(anchors[5], anchors[6], 20));
        smgents.push(new Segment(anchors[6], anchors[7], 20));
        smgents.push(new Segment(anchors[7], anchors[8], 20));
        smgents.push(new Segment(anchors[8], anchors[2], 40));
        smgents.push(new Segment(anchors[3], anchors[9], 20));
        smgents.push(new Segment(anchors[3], anchors[10], 20));
        smgents.push(new Segment(anchors[3], anchors[6], 20));
        smgents.push(new Segment(anchors[1], anchors[11], 20));
        smgents.push(new Segment(anchors[8], anchors[11], 40));
        smgents.push(new Segment(anchors[6], anchors[11], 20));
        for (var key in anchors) {
            anchors[key].build();
        }
        var script = "";
        for (var segment of smgents) {
            script += (`full(${JSON.stringify(segment.points)});\r\n`);
        }
        console.log(script);
```

## 效果
![avatar](/documents/demo.png)





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