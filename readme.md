
## 说明
***Plane Wall Designer*** 是一个2D墙体生成器。用来生成3D中墙体所需要的二维数据。

* 矢量绘制，超清晰。
* 带自动滚动调整的刻度尺。
* 双击添加锚点。
* 左键按住可拖动画板。
* 左键单击锚点或墙对象可选中。
* 单击toolbar上的【连接】可创建新的墙。
* 创建墙模式下单击左键创建、单击右键取消。
* 单击右键取消选择对象。
* 鼠标滚轮可在5%-4000%之间缩放。
* 单击下方生成按钮生成坐标数据，每行6个point组成一个多边形。
* 选中锚点后可按下左键拖动锚点
* 拖动锚点到其他锚点时合并锚点
* 拖动锚点到其他墙上时合并到目标墙上
* 创建的墙可以直接连接到墙上了
* toolbar可拖动了
* 点击生成按钮可以生成多边形数据
* `角度排序算法有问题，和别角度排序错误`
* 创建锚点时增加了磁性吸附功能(二分法查找最近似值)
* 生成的数据可以解析到designer了
* 拖动锚点时支持磁性吸附了
* 合并到墙壁时支持磁性吸附了
* 增加锚点的Toolbar坐标设置
* 双击墙可以分割墙并插入锚点
* 取消实时渲染，按需要渲染
* 把锚点拖到另一个锚点上可以合并锚点
* 双击创建锚点在选中对象的情况下将不可用
* 在墙上双击始终分割墙并加入锚点
* 鼠标在墙上按下200毫秒后会进入拖动状态
* 鼠标在锚点按下50毫秒延迟后进入拖动状态
* 鼠标位置线 一般为绿色，磁性吸附后变蓝色
* 点击生成按钮可以导出json格式数据啦
* 点击清空按钮可清理当前界面所有墙和锚点
* 点击回到中心按钮可还原100%缩放并回到中心位置





![click-me](/documents/pic.png)

---

## 原理
* 连接每个锚点，创建线对象，为每条线设置厚度
* 对锚点下所有连接的锚点进行顺时针排序
* 对相邻的两条线的左右边界进行交点方程计算得出交点。
![click-me](/documents/readme.png)


## DEMO 
***PlaneWallGenerator***

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

## 结果
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