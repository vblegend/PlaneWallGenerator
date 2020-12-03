
export interface IVector2 {
    x: number;
    y: number;
}

export class Vector2 {

    public x: number;
    public y: number;


    public constructor(_x?: number, _y?: number) {
        this.x = _x ? _x : 0;
        this.y = _y ? _y : 0;
    }


    public round4(): this {
        this.x = (this.x * 10000 | 0) / 10000;
        this.y = (this.y * 10000 | 0) / 10000;
        return this;
    }

    public round2(): this {
        this.x = (this.x * 100 | 0) / 100;
        this.y = (this.y * 100 | 0) / 100;
        return this;
    }

    public round0(): this {
        this.x = this.x | 0;
        this.y = this.y | 0;
        return this;
    }


    public inCircle(center: Vector2, radius: number) {
        var distance = this.distanceTo(center);
        return distance < radius;
    }


    public fromArray(values: number[]): this {
        this.x = values[0];
        this.y = values[1];
        return this;
    }

    public sub(v: Vector2): Vector2 {
        return new Vector2(this.x - v.x, this.y - v.y);
    }

    public add(v: Vector2): Vector2 {
        return new Vector2(this.x + v.x, this.y + v.y);
    }

    public clone(): Vector2 {
        return new Vector2(this.x, this.y);
    }

    public copy(v: Vector2) {
        this.x = v.x;
        this.y = v.y;
    }

    public set(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public equals(v: Vector2): boolean {
        return this.x === v.x && this.y === v.y;
    }


    /**
     * Updates the value of the vector and returns the change
     * @param v 
     */
    public update(v: Vector2): boolean {
        let updated = !this.equals(v);
        this.x = v.x;
        this.y = v.y;
        return updated;
    }

    /**
     * 判断当前点是否位于多边形内
     * @param polygon 多边形
     */
    public inPolygon(polygon: Vector2[]): boolean {
        let sum = 0;
        for (var i = 0, l = polygon.length, j = l - 1; i < l; j = i, i++) {
            const sx = polygon[i].x;
            const sy = polygon[i].y;
            const tx = polygon[j].x;
            const ty = polygon[j].y;
            // 点与多边形顶点重合或在多边形的边上
            if ((sx - this.x) * (this.x - tx) >= 0 && (sy - this.y) * (this.y - ty) >= 0 && (this.x - sx) * (ty - sy) === (this.y - sy) * (tx - sx)) {
                return true;
            }
            // 点与相邻顶点连线的夹角
            var angle = Math.atan2(sy - this.y, sx - this.x) - Math.atan2(ty - this.y, tx - this.x);
            // 确保夹角不超出取值范围（-π 到 π）
            if (angle >= Math.PI) {
                angle = angle - Math.PI * 2;
            } else if (angle <= -Math.PI) {
                angle = angle + Math.PI * 2;
            }
            sum += angle;
        }
        // 计算回转数并判断点和多边形的几何关系
        return Math.round(sum / Math.PI) === 0 ? false : true;
    }


    public distanceTo(v: Vector2): number {
        const dx = this.x - v.x;
        const dy = this.y - v.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    public radian(v: Vector2): number {
        let angle = Math.atan2(this.y - v.y, this.x - v.x)
        return angle;
    }

    public angle(v: Vector2): number {
        return this.radian(v) / Math.PI * 180;
    }

    public center(v: Vector2): Vector2 {
        let left = this.x;
        let top = this.y;
        let right = this.x;
        let bottom = this.y;
        if (left > v.x) left = v.x;
        if (top > v.y) top = v.y;
        if (bottom < v.y) bottom = v.y;
        if (right < v.x) right = v.x;
        return new Vector2(left + (right - left) / 2, top + (bottom - top) / 2);
    }


    /**
     * 计算点(point)在线(P1->P2)上的投影坐标
     * @param P1 
     * @param P2 
     * @param point 
     */
    public static getProjectivePoint(P1: Vector2, P2: Vector2, point: Vector2): Vector2 {
        var pLine = P1;
        if (P1.x === P2.x && P1.y === P2.y) {
            return P1;
        }
        if (P1.x === P2.x) {
            return new Vector2(pLine.x, point.y);
        }
        else if (P1.y === P2.y) //垂线斜率不存在情况
        {
            return new Vector2(point.x, pLine.y);
        }
        //计算线的斜率
        var k = ((P1.y - P2.y)) / (P1.x - P2.x);
        var X = ((k * pLine.x + point.x / k + point.y - pLine.y) / (1 / k + k));
        var Y = (-1 / k * (X - point.x) + point.y);
        return new Vector2(X, Y);
    }

    /**
     * 计算 当前点 围绕center旋转a度所在位置
     * @param point 旋转源点
     * @param center 旋转中心点
     * @param a 旋转角度
     */
    public rotatePoint(center: Vector2, a: number): Vector2 {
        var ang = a / 180 * Math.PI;
        var x = (this.x - center.x) * Math.cos(ang) - (this.y - center.y) * Math.sin(ang) + center.x;
        var y = (this.x - center.x) * Math.sin(ang) + (this.y - center.y) * Math.cos(ang) + center.y;
        return new Vector2(x, y);
    }


    /**
     * 极坐标排序
     * 点的顺时针排序算法
     * https://stackoverflow.com/questions/6989100/sort-points-in-clockwise-order
     * @param a 
     * @param b 
     * @param center 
     */
    private static lessCcw(a: IVector2, b: IVector2, center: IVector2): boolean {
        // Computes the quadrant for a and b (0-3):
        //     ^
        //   1 | 0
        //  ---+-->
        //   2 | 3
        const dax = ((a.x - center.x) > 0) ? 1 : 0;
        const day = ((a.y - center.y) > 0) ? 1 : 0;
        const qa = (1 - dax) + (1 - day) + ((dax & (1 - day)) << 1);
        const dbx = ((b.x - center.x) > 0) ? 1 : 0;
        const dby = ((b.y - center.y) > 0) ? 1 : 0;
        const qb = (1 - dbx) + (1 - dby) + ((dbx & (1 - dby)) << 1);
        if (qa == qb) {
            return (b.x - center.x) * (a.y - center.y) < (b.y - center.y) * (a.x - center.x);
        } else {
            return qa < qb;
        }
    }

    /**
     * 逆时针排序 
     * https://www.cnblogs.com/dwdxdy/p/3230156.html
     * @param vPoints 
     */
    public static clockwiseSortPoints(vPoints: IVector2[], center: IVector2) {
        //冒泡排序
        for (var i = 0; i < vPoints.length - 1; i++) {
            for (var j = 0; j < vPoints.length - i - 1; j++) {
                if (this.lessCcw(vPoints[j], vPoints[j + 1], center)) {
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
     * @param lineFirstStar 
     * @param lineFirstEnd 
     * @param lineSecondStar 
     * @param lineSecondEnd 
     */
    public static getIntersection(lineFirstStar: Vector2, lineFirstEnd: Vector2, lineSecondStar: Vector2, lineSecondEnd: Vector2): Vector2 {
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