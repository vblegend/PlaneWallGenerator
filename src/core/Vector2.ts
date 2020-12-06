
export interface IVector2 {
    x: number;
    y: number;
}

export class Vector2 implements IVector2 {

    public x: number;
    public y: number;

    private static divisors: number[] = [1, 10, 100, 1000, 10000, 100000, 1000000, 10000000, 100000000];

    public constructor(_x?: number, _y?: number) {
        this.x = _x ? _x : 0;
        this.y = _y ? _y : 0;
        
    }

    public round(precision?: number): this {
        if (precision == null || precision === 0) {
            this.x = Math.round(this.x);
            this.y = Math.round(this.y);
            return this;
        }
        var div = Vector2.divisors[precision];
        if (div == null) {
            throw new Error('Unsupported precision parameters!');
        }
        this.x = Math.floor(this.x * div) / div;
        this.y = Math.floor(this.y * div) / div;
        return this;
    }

    /**
     * set x,y value = 0
     */
    public zero(): this {
        this.x = 0;
        this.y = 0;
        return this;
    }

    /**
     * set x,y value = null
     */
    public null(): this {
        this.x = null;
        this.y = null;
        return this;
    }



    public inCircle(center: Vector2, radius: number): boolean {
        var distance = this.distanceTo(center);
        return distance < radius;
    }

    public toArray(): number[] {
        return [this.x, this.y];
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

    public copy(v: Vector2): this {
        this.x = v.x;
        this.y = v.y;
        return this;
    }

    public set(x: number, y: number): this {
        this.x = x;
        this.y = y;
        return this;
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
        let angle = Math.atan2(this.y - v.y, this.x - v.x);
        return angle;
    }

    public angle(v: Vector2): number {
        return 180 * this.radian(v) / Math.PI;
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
     * 计算 当前点 围绕center旋转a度所在位置
     * @param point 旋转源点
     * @param center 旋转中心点
     * @param a 旋转角度
     */
    public around(center: Vector2, a: number): Vector2 {
        var ang = a / 180 * Math.PI;
        var x = (this.x - center.x) * Math.cos(ang) - (this.y - center.y) * Math.sin(ang) + center.x;
        var y = (this.x - center.x) * Math.sin(ang) + (this.y - center.y) * Math.cos(ang) + center.y;
        return new Vector2(x, y);
    }


    public moveTo(dist: Vector2, moveDistance: number) {
        var angle = this.angle(dist);
        var point = new Vector2(this.x - moveDistance, this.y);
        return point.around(this, angle);
    }

    

}