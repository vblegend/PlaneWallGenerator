import { IVector2, Vector2 } from './Vector2';



export class MathHelper {


    /**
     * 计算点(point)在线(P1->P2)上的投影坐标
     * @param P1 
     * @param P2 
     * @param point 
     */
    public static getProjectivePoint(P1: Vector2, P2: Vector2, point: Vector2): Vector2 {
        const pLine = P1;
        if (P1.x === P2.x && P1.y === P2.y) {
            return P1;
        }
        if (P1.x === P2.x) {
            return new Vector2(pLine.x, point.y);
        }
        else if (P1.y === P2.y) // 垂线斜率不存在情况
        {
            return new Vector2(point.x, pLine.y);
        }
        // 计算线的斜率
        const k = ((P1.y - P2.y)) / (P1.x - P2.x);
        const X = ((k * pLine.x + point.x / k + point.y - pLine.y) / (1 / k + k));
        const Y = (-1 / k * (X - point.x) + point.y);
        return new Vector2(X, Y);
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
     * 将点列表 以center为中心逆时针排序 
     * https://www.cnblogs.com/dwdxdy/p/3230156.html
     * @param vPoints 
     */
    public static clockwiseSortPoints(vPoints: IVector2[], center: IVector2) {
        // 冒泡排序
        for (let i = 0; i < vPoints.length - 1; i++) {
            for (let j = 0; j < vPoints.length - i - 1; j++) {
                if (this.lessCcw(vPoints[j], vPoints[j + 1], center)) {
                    const tmp = vPoints[j];
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
        let a = 0;
        let b = 0;
        let state = 0;
        if (Math.abs(lineFirstStar.x - lineFirstEnd.x) > 0.000001) {
            a = (lineFirstEnd.y - lineFirstStar.y) / (lineFirstEnd.x - lineFirstStar.x);
            state |= 1;
        }
        if (Math.abs(lineSecondStar.x - lineSecondEnd.x) > 0.000001) {
            b = (lineSecondEnd.y - lineSecondStar.y) / (lineSecondEnd.x - lineSecondStar.x);
            state |= 2;
        }
        switch (state) {
            case 0: // L1与L2都平行Y轴
                {
                    if (lineFirstStar.x === lineSecondStar.x) {
                        // throw new Exception("两条直线互相重合，且平行于Y轴，无法计算交点。");
                        return null;
                    }
                    else {
                        // throw new Exception("两条直线互相平行，且平行于Y轴，无法计算交点。");
                        return null;
                    }
                }
            case 1: // L1存在斜率, L2平行Y轴
                {
                    const x = lineSecondStar.x;
                    const y = (lineFirstStar.x - x) * (-a) + lineFirstStar.y;
                    return new Vector2(x, y);
                }
            case 2: // L1 平行Y轴，L2存在斜率
                {
                    const x = lineFirstStar.x;
                    // 网上有相似代码的，这一处是错误的。你可以对比case 1 的逻辑 进行分析
                    // 源code:lineSecondStar * x + lineSecondStar * lineSecondStar.X + p3.Y;
                    const y = (lineSecondStar.x - x) * (-b) + lineSecondStar.y;
                    return new Vector2(x, y);
                }
            case 3: // L1，L2都存在斜率
                {
                    if (a === b) {
                        // throw new Exception("两条直线平行或重合，无法计算交点。");
                        return null;
                    }
                    const x = (a * lineFirstStar.x - b * lineSecondStar.x - lineFirstStar.y + lineSecondStar.y) / (a - b);
                    const y = a * x - a * lineFirstStar.x + lineFirstStar.y;
                    return new Vector2(x, y);
                }
        }
        // throw new Exception("不可能发生的情况");
        return null;
    }







    /**
     * 计算贝塞尔曲线的坐标
    * @param poss 贝塞尔曲线控制点坐标
    * @param precision 精度，需要计算的该条贝塞尔曲线上的点的数目
    * @return 该条贝塞尔曲线上的点（二维坐标）
    * https://www.cnblogs.com/fangsmile/p/11642784.html
    */
    public bezierCalculate(poss: Vector2[], precision: number): Vector2[] {
        // 维度，坐标轴数（二维坐标，三维坐标...）
        const dimersion = 2;
        // 贝塞尔曲线控制点数（阶数）
        const number = poss.length;
        // 控制点数不小于 2 ，至少为二维坐标系
        if (number < 2 || dimersion < 2)
            return null;
        const result = [];
        // 计算杨辉三角
        const mi = [];
        mi[0] = mi[1] = 1;
        for (let i = 3; i <= number; i++) {
            const t = [];
            for (let j = 0; j < i - 1; j++) {
                t[j] = mi[j];
            }
            mi[0] = mi[i - 1] = 1;
            for (let j = 0; j < i - 2; j++) {
                mi[j + 1] = t[j] + t[j + 1];
            }
        }

        // 计算坐标点
        for (let i = 0; i < precision; i++) {
            const t = i / precision;
            const p = new Vector2(0, 0);
            result.push(p);
            for (let j = 0; j < dimersion; j++) {
                let temp = 0.0;
                for (let k = 0; k < number; k++) {
                    temp += Math.pow(1 - t, number - k - 1) * (j == 0 ? poss[k].x : poss[k].y) * Math.pow(t, k) * mi[k];
                }
                j == 0 ? p.x = temp : p.y = temp;
            }
            // p.x = this.toDecimal(p.x);
            // p.y = this.toDecimal(p.y);
        }

        return result;
    }


    /**
     * 计算贝塞尔曲线与直线的交点
     * https://www.it1352.com/503106.html
     * @param p1 贝塞尔曲线控制点a
     * @param p2 贝塞尔曲线控制点b
     * @param p3 贝塞尔曲线控制点c
     * @param a1 直线坐标a
     * @param a2 直线坐标b
     */
    public calcQLintersects(p1: Vector2, p2: Vector2, p3: Vector2, a1: Vector2, a2: Vector2): Vector2[] {
        const intersections = [];
        // inverse line normal
        const normal = { x: a1.y - a2.y, y: a2.x - a1.x };
        // Q-coefficients
        const c2 = { x: p1.x + p2.x * -2 + p3.x, y: p1.y + p2.y * -2 + p3.y };
        const c1 = { x: p1.x * -2 + p2.x * 2, y: p1.y * -2 + p2.y * 2 };
        const c0 = { x: p1.x, y: p1.y };
        // Transform to line 
        const coefficient = a1.x * a2.y - a2.x * a1.y;
        const a = normal.x * c2.x + normal.y * c2.y;
        const b = (normal.x * c1.x + normal.y * c1.y) / a;
        const c = (normal.x * c0.x + normal.y * c0.y + coefficient) / a;

        // solve the roots
        const roots = [];
        const d = b * b - 4 * c;
        if (d > 0) {
            // const e = Math.sqrt(d);
            roots.push((-b + Math.sqrt(d)) / 2);
            roots.push((-b - Math.sqrt(d)) / 2);
        } else if (d == 0) {
            roots.push(-b / 2);
        }

        // calc the solution points
        for (let i = 0; i < roots.length; i++) {
            const minX = Math.min(a1.x, a2.x);
            const minY = Math.min(a1.y, a2.y);
            const maxX = Math.max(a1.x, a2.x);
            const maxY = Math.max(a1.y, a2.y);
            const t = roots[i];
            if (t >= 0 && t <= 1) {
                // possible point -- pending bounds check
                const point = {
                    x: this.lerp(this.lerp(p1.x, p2.x, t), this.lerp(p2.x, p3.x, t), t),
                    y: this.lerp(this.lerp(p1.y, p2.y, t), this.lerp(p2.y, p3.y, t), t)
                };
                const x = point.x;
                const y = point.y;
                // bounds checks
                if (a1.x == a2.x && y >= minY && y <= maxY) {
                    // vertical line
                    intersections.push(point);
                } else if (a1.y == a2.y && x >= minX && x <= maxX) {
                    // horizontal line
                    intersections.push(point);
                } else if (x >= minX && y >= minY && x <= maxX && y <= maxY) {
                    // line passed bounds check
                    intersections.push(point);
                }
            }
        }
        return intersections;
    }


    private lerp(a: number, b: number, x: number): number {
        return (a + x * (b - a));
    }





    public static reLocation(points: number[][], center: number[]): number[] {
        for (let i = 0; i < points.length; i++) {
            const point = points[i];
            point[0] -= center[0];
            point[1] -= center[1];
        }
        return center;
    }


    public static getCenter(points: number[][]): number[] {
        let left = points[0][0];
        let right = points[0][0];
        let top = points[0][1];
        let bottom = points[0][1];
        for (let i = 1; i < points.length; i++) {
            const point = points[i];
            if (point[0] > right) right = point[0];
            if (point[0] < left) left = point[0];
            if (point[1] > bottom) bottom = point[1];
            if (point[1] < top) top = point[1];
        }
        return [left + (right - left) / 2, top + (bottom - top) / 2];
    }


    /**
     * clone array
     * @param points 
     */
    public static clone2Array(points: number[][]): number[][] {
        const result: number[][] = [];
        for (let x = 0; x < points.length; x++) {
            result[x] = [];
            for (let y = 0; y < points[x].length; y++) {
                result[x][y] = points[x][y];
            }
        }
        return result;
    }




}