
## 说明
PlaneWallGenerator 是一个使用2D数据来生成3D墙体数据的工具。
根据提供的2D锚点坐标和连接锚点的线进行每面墙体的生成 如下图所示，可以单独设置每面墙体的厚度。

## 原理
![avatar](/documents/readme.png)


## DEMO 

``` typescript
        var adorners: { [key: number]: Adorner } = {};
        adorners[0] = new Adorner(0, 100, 100);
        adorners[1] = new Adorner(1, 200, 100);
        adorners[2] = new Adorner(2, 400, 100);
        adorners[3] = new Adorner(3, 200, 200);
        adorners[4] = new Adorner(4, 100, 300);
        adorners[5] = new Adorner(5, 150, 350);
        adorners[6] = new Adorner(6, 200, 300);
        adorners[7] = new Adorner(7, 270, 350);
        adorners[8] = new Adorner(8, 400, 250);
        adorners[9] = new Adorner(9, 180, 200);
        adorners[10] = new Adorner(10, 220, 200);
        adorners[11] = new Adorner(11, 300, 200);

        var smgents: Segment[] = [];
        smgents.push(new Segment(adorners[0], adorners[1], 20));
        smgents.push(new Segment(adorners[0], adorners[4], 20));
        smgents.push(new Segment(adorners[1], adorners[3], 20));
        smgents.push(new Segment(adorners[2], adorners[1], 40));
        smgents.push(new Segment(adorners[4], adorners[5], 20));
        smgents.push(new Segment(adorners[5], adorners[6], 20));
        smgents.push(new Segment(adorners[6], adorners[7], 20));
        smgents.push(new Segment(adorners[7], adorners[8], 20));
        smgents.push(new Segment(adorners[8], adorners[2], 40));
        smgents.push(new Segment(adorners[3], adorners[9], 20));
        smgents.push(new Segment(adorners[3], adorners[10], 20));
        smgents.push(new Segment(adorners[3], adorners[6], 20));
        smgents.push(new Segment(adorners[1], adorners[11], 20));
        smgents.push(new Segment(adorners[8], adorners[11], 40));
        smgents.push(new Segment(adorners[6], adorners[11], 20));
        for (var key in adorners) {
            adorners[key].build();
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