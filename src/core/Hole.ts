import { Vector2 } from "./Vector2";
import { Wall } from "./Wall";


export class Hole {
    public id: number;
    public height: number;
    public width: number;
    public location: number;
    public thickness: number;
    public ground: number;
    public _parent: Wall;
    public angle: number;
    private _points: Vector2[];
    private position: Vector2;


    public constructor() {
        this._parent = null;
        this._points = [new Vector2(), new Vector2(), new Vector2(), new Vector2()];
        this.position = new Vector2();
    }

    public update() {
        if (this.installed) {
            const offsetDistance = this._parent.length * this.location;
            const pos = this._parent.anchors[0].position.moveTo(this._parent.anchors[1].position, offsetDistance);
            this.position.copy(pos);
            // 计算 门对象的矩形区域，用于鼠标检测
            let thickness = this._parent.thickness / 2 + 1;
            const l1 = new Vector2(this.position.x - this.width / 2, this.position.y - thickness);
            const l2 = new Vector2(this.position.x - this.width / 2, this.position.y + thickness);
            const r1 = new Vector2(this.position.x + this.width / 2, this.position.y - thickness);
            const r2 = new Vector2(this.position.x + this.width / 2, this.position.y + thickness);
            this.angle = this._parent.angle;
            this._points[0].copy(l1.around(this.position, this.angle));
            this._points[1].copy(r1.around(this.position, this.angle));
            this._points[2].copy(r2.around(this.position, this.angle));
            this._points[3].copy(l2.around(this.position, this.angle));
        }
    }

    public install(parent: Wall) {
        this._parent = parent;
    }

    public unInstall() {
        this._parent = null;
    }

    public get installed(): boolean {
        return this._parent != null;
    }

    public get points(): number[][] {
        const array: number[][] = [];
        for (let i = 0; i < 4; i++) {
            array.push([this._points[i].x, this._points[i].y]);
        }
        return array;

    }

    /**
     * remove this segment from graphic
     */
    public remove() {
        if (this.installed) {
            this._parent.removeHole(this);
        }
    }



}