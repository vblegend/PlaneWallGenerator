export class Vector2 {

    public x: number;
    public y: number;


    public constructor(_x?: number, _y?: number) {
        this.x = _x ? _x : 0;
        this.y = _y ? _y : 0;
    }



    public inCircle(center: Vector2, radius: number) {
        var distance = this.distanceTo(center);
        return distance < radius;
        // return ((this.x - center.x) ^ 2 + (this.y - center.y) ^ 2) < (radius ^ 2);
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






}