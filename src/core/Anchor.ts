import { Segment } from "./Segment";
import { Vector2 } from "./Vector2";

export class Anchor {
    private _x: number;
    private _y: number;
    public id: number;
    private _targets: Anchor[];
    private _map: Map<Anchor, Segment>;

    public constructor(id: number, x: number, y: number) {
        this._x = x;
        this._y = y;
        this._targets = [];
        this._map = new Map();
    }

    public get x(): number {
        return this._x;
    }

    public get y(): number {
        return this._y;
    }

    private get point(): Vector2 {
        return new Vector2(this._x, this._y);
    }

    public get targets(): Anchor[] {
        return this._targets;
    }


    public setPosition(v: Vector2) {
        this._x = v.x;
        this._y = v.y;
    }



    public dispose() {
        this.remove();
    }


    public remove() {
        if (this._targets.length > 0) {
            // remove all segments and self
            while (this._targets.length > 0) {
                let anchor = this._targets.shift();
                var segment = this._map.get(anchor);
                segment.dispose();
            }
        }
    }




    /**
     * add connection target
     * @param object  target
     * @param segment  segment obejct
     */
    public addTarget(object: Anchor, segment: Segment) {
        if (!this._map.has(object)) {
            this._targets.push(object);
            this._map.set(object, segment);
        }
    }

    public removeTarget(object: Anchor) {
        if (this._map.has(object)) {
            this._map.delete(object);
        }
        var index = this._targets.indexOf(object);
        if (index > -1) {
            this._targets.splice(index, 1);
        }
    }

    /**
     * generate the edge on both sides of the path
     * @param target  target 
     * @param right   is right  edge
     */
    private generateEdgePoints(target: Anchor, right: boolean = true): Vector2[] {
        var eulr = right ? 90 : -90;;
        var segment = this._map.get(target);
        var start = new Vector2(this.x, this.y);
        var end = new Vector2(target.x, target.y);
        var off = segment.thickness / 2;
        var angle = Math.atan2((end.y - start.y), (end.x - start.x));
        var theta = angle * (180 / Math.PI);
        var ps = new Vector2(start.x + off, start.y);
        var pe = new Vector2(end.x + off, end.y);
        var left_point = this.rotatePoint(ps, start, theta - eulr);
        var right_point = this.rotatePoint(pe, end, theta - eulr);
        return [left_point, right_point];
    }


    /**
     * build segments paths 
     */
    public build() {

        if (this._targets.length > 1) {
            /* sort points by clockwise */
            this.clockwiseSortPoints(this._targets);
            /* generate points */
            for (var i = 0; i < this._targets.length; i++) {
                var cur = i;
                var next = (i + 1) % this._targets.length;
                var anchor = this._targets[cur];
                var nextanchor = this._targets[next];
                /* generate edge points */
                var edge_path = this.generateEdgePoints(anchor, true);
                var nextEdge_path = this.generateEdgePoints(nextanchor, false);
                /* get edges intersection point*/
                var intersectionPoint = this.getIntersection(edge_path[0], edge_path[1], nextEdge_path[0], nextEdge_path[1]);
                if (intersectionPoint === null) {
                    /* get projective point */
                    intersectionPoint = this.GetProjectivePoint(edge_path[0], edge_path[1], this.point);
                }
                var segment = this._map.get(anchor);
                var points = segment.getPort(this);
                points[1] = this.point.clone();
                points[0] = intersectionPoint.clone();
                segment = this._map.get(nextanchor);
                points = segment.getPort(this);
                points[2] = intersectionPoint.clone();
                points[1] = this.point.clone();
            }
        }
        else if (this._targets.length === 1) {
            var anchor = this._targets[0];
            var segment = this._map.get(anchor);
            var start = new Vector2(this.x, this.y);
            var end = new Vector2(anchor.x, anchor.y);
            var angle = Math.atan2((end.y - start.y), (end.x - start.x));
            var theta = angle * (180 / Math.PI);
            var ps = new Vector2(start.x + segment.thickness / 2, start.y);
            var left_point = this.rotatePoint(ps, start, theta - 90);
            var right_point = this.rotatePoint(ps, start, theta + 90);
            var points = segment.getPort(this);
            points[0] = left_point.clone();
            points[1] = this.point.clone();
            points[2] = right_point.clone();
        }
        
    }



    protected GetProjectivePoint(P1: Vector2, P2: Vector2, pOut: Vector2): Vector2 {
        var pLine = P1;
        if (P1.x === P2.x && P1.y === P2.y) {
            return P1;
        }
        if (P1.x === P2.x) {
            return new Vector2(pLine.x, pOut.y);
        }
        else if (P1.y === P2.y) //垂线斜率不存在情况
        {
            return new Vector2(pOut.x, pLine.y);
        }
        //计算线的斜率
        var k = ((P1.y - P2.y)) / (P1.x - P2.x);
        var X = ((k * pLine.x + pOut.x / k + pOut.y - pLine.y) / (1 / k + k));
        var Y = (-1 / k * (X - pOut.x) + pOut.y);
        return new Vector2(X, Y);
    }


    /**
     * point 围绕 center 旋转 a 度
     * @param point 旋转源点
     * @param center 旋转中心点
     * @param a 旋转角度
     */
    protected rotatePoint(point: Vector2, center: Vector2, a: number): Vector2 {
        var ang = a / 180 * Math.PI;
        var x = (point.x - center.x) * Math.cos(ang) - (point.y - center.y) * Math.sin(ang) + center.x;
        var y = (point.x - center.x) * Math.sin(ang) + (point.y - center.y) * Math.cos(ang) + center.y;
        return new Vector2(x, y);
    }


    //若点a大于点b,即点a在点b顺时针方向,返回true,否则返回false
    private PointCmp(a: Anchor, b: Anchor, center: Anchor): boolean {
        if (a.x >= 0 && b.x < 0)
            return true;
        if (a.x === 0 && b.x === 0)
            return a.y > b.y;
        //向量OA和向量OB的叉积
        var det = (a.x - center.x) * (b.y - center.y) - (b.x - center.x) * (a.y - center.y);
        if (det < 0)
            return true;
        if (det > 0)
            return false;
        //向量OA和向量OB共线，以距离判断大小
        var d1 = (a.x - center.x) * (a.x - center.x) + (a.y - center.y) * (a.y - center.y);
        var d2 = (b.x - center.x) * (b.x - center.y) + (b.y - center.y) * (b.y - center.y);
        return d1 > d2;
    }

    /**
     * 逆时针排序 
     * https://www.cnblogs.com/dwdxdy/p/3230156.html
     * @param vPoints 
     */
    private clockwiseSortPoints(vPoints: Anchor[]) {
        //计算重心
        // var x = 0;
        // var y = 0;
        // for (var i = 0; i < vPoints.length; i++) {
        //     x += vPoints[i].x;
        //     y += vPoints[i].y;
        // }
        // center.x = x / vPoints.length;
        // center.y = y / vPoints.length;
        var center = this;
        //冒泡排序
        for (var i = 0; i < vPoints.length - 1; i++) {
            for (var j = 0; j < vPoints.length - i - 1; j++) {
                if (!this.PointCmp(vPoints[j], vPoints[j + 1], center)) {
                    var tmp = vPoints[j];
                    vPoints[j] = vPoints[j + 1];
                    vPoints[j + 1] = tmp;
                }
            }
        }
    }


    /**
     * 计算两条直线的交点
     * https://www.cnblogs.com/xiaotiannet/p/3768611.html
     * @optimize lineFirstStar.X != lineFirstEnd.X 当角度够小的时候 浮点数精度不够表示斜率的 结果会偏移挺大 用差值小于某个小数比较好 <0.000001 这样
     * 
     * @param lineFirstStar 
     * @param lineFirstEnd 
     * @param lineSecondStar 
     * @param lineSecondEnd 
     */
    private getIntersection(lineFirstStar: Vector2, lineFirstEnd: Vector2, lineSecondStar: Vector2, lineSecondEnd: Vector2): Vector2 {
        /*
         * L1，L2都存在斜率的情况：
         * 直线方程L1: ( y - y1 ) / ( y2 - y1 ) = ( x - x1 ) / ( x2 - x1 ) 
         * => y = [ ( y2 - y1 ) / ( x2 - x1 ) ]( x - x1 ) + y1
         * 令 a = ( y2 - y1 ) / ( x2 - x1 )
         * 有 y = a * x - a * x1 + y1   .........1
         * 直线方程L2: ( y - y3 ) / ( y4 - y3 ) = ( x - x3 ) / ( x4 - x3 )
         * 令 b = ( y4 - y3 ) / ( x4 - x3 )
         * 有 y = b * x - b * x3 + y3 ..........2
         * 
         * 如果 a = b，则两直线平等，否则， 联解方程 1,2，得:
         * x = ( a * x1 - b * x3 - y1 + y3 ) / ( a - b )
         * y = a * x - a * x1 + y1
         * 
         * L1存在斜率, L2平行Y轴的情况：
         * x = x3
         * y = a * x3 - a * x1 + y1
         * 
         * L1 平行Y轴，L2存在斜率的情况：
         * x = x1
         * y = b * x - b * x3 + y3
         * 
         * L1与L2都平行Y轴的情况：
         * 如果 x1 = x3，那么L1与L2重合，否则平等
         * 
        */
        var a = 0;
        var b = 0;
        var state = 0;
        if (Math.abs(lineFirstStar.x - lineFirstEnd.x) > 0.000001) {
            a = (lineFirstEnd.y - lineFirstStar.y) / (lineFirstEnd.x - lineFirstStar.x);
            state |= 1;
        }
        if (Math.abs(lineSecondStar.x - lineSecondEnd.x) > 0.000001) {
            b = (lineSecondEnd.y - lineSecondStar.y) / (lineSecondEnd.x - lineSecondStar.x);
            state |= 2;
        }
        switch (state) {
            case 0: //L1与L2都平行Y轴
                {
                    if (lineFirstStar.x === lineSecondStar.x) {
                        //throw new Exception("两条直线互相重合，且平行于Y轴，无法计算交点。");
                        return null;
                    }
                    else {
                        //throw new Exception("两条直线互相平行，且平行于Y轴，无法计算交点。");
                        return null;
                    }
                }
            case 1: //L1存在斜率, L2平行Y轴
                {
                    var x = lineSecondStar.x;
                    var y = (lineFirstStar.x - x) * (-a) + lineFirstStar.y;
                    return new Vector2(x, y);
                }
            case 2: //L1 平行Y轴，L2存在斜率
                {
                    var x = lineFirstStar.x;
                    //网上有相似代码的，这一处是错误的。你可以对比case 1 的逻辑 进行分析
                    //源code:lineSecondStar * x + lineSecondStar * lineSecondStar.X + p3.Y;
                    var y = (lineSecondStar.x - x) * (-b) + lineSecondStar.y;
                    return new Vector2(x, y);
                }
            case 3: //L1，L2都存在斜率
                {
                    if (a === b) {
                        // throw new Exception("两条直线平行或重合，无法计算交点。");
                        return null;
                    }
                    var x = (a * lineFirstStar.x - b * lineSecondStar.x - lineFirstStar.y + lineSecondStar.y) / (a - b);
                    var y = a * x - a * lineFirstStar.x + lineFirstStar.y;
                    return new Vector2(x, y);
                }
        }
        // throw new Exception("不可能发生的情况");
        return null;
    }

}