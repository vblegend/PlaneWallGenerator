import { Anchor } from "./Anchor";
import { Vector2 } from "./Vector2";
import { Hole } from './Hole';

export class Wall {
    public id: number;
    private _thickness: number;
    private _start: Anchor;
    private _end: Anchor;
    private _ports: Vector2[][];
    private _updated: boolean;
    private _points: number[][];
    private _holes: Hole[];




    public constructor(id: number, start: Anchor, end: Anchor, thickness: number) {
        this.id = id;
        this._start = start;
        this._end = end;
        this._thickness = thickness;
        this._ports = [];
        this._points = [];
        this._holes = [];
        this._ports.push([new Vector2(), new Vector2(), new Vector2()], [new Vector2(), new Vector2(), new Vector2()]);
        this._start.addTarget(this._end, this);
        this._end.addTarget(this._start, this);
        this._updated = false;
    }


    public get anchors(): Anchor[] {
        return [this._start, this._end];
    }


    public get holes(): Hole[] {
        return this._holes;
    }


    public addHole(hole: Hole) {
        if (this._holes.indexOf(hole) == -1) {
            hole.install(this);
            this._holes.push(hole);
        }
    }

    public removeHole(hole: Hole) {
        let index = this._holes.indexOf(hole);
        if (index > -1) {
            this._holes[index].unInstall();
            this._holes.splice(index, 1);
        }
    }





    public dispose() {
        this.remove();
        if (this._ports) {
            this._ports.length = 0;
            this._ports = null;
        }
    }


    /**
     * The points has been updated
     */
    public get needUpdated(): boolean {
        return this._updated;
    }


    /**
     * The points need updated
     */
    public needUpdate(): boolean {
        this._updated = true;
        return true;
    }


    /**
     * remove this segment from graphic
     */
    public remove() {
        if (this._start) {
            this._start.removeTarget(this._end);
            this._end.removeTarget(this._start);
            this._end = null;
            this._start = null;
        }
    }


    public update() {
        if (this._updated) {
            this._points = [];
            for (let i = 0; i < 3; i++) {
                this._points[i] = [this._ports[0][i].x, this._ports[0][i].y];
                this._points[i + 3] = [this._ports[1][i].x, this._ports[1][i].y];
            }
            for (let i = 0; i < this._holes.length; i++) {
                this._holes[i].update();
            }
            this._updated = false;
        }
    }






    public get points(): number[][] {
        return this._points;
    }





    public getPort(anchor: Anchor): Vector2[] {
        if (this._start === anchor)
            return this._ports[0];
        else
            return this._ports[1];
    }

    public get angle(): number {
        return this._start.position.angle(this._end.position);
    }

    public get length(): number {
        return this._start.position.distanceTo(this._end.position);
    }

    public get thickness(): number {
        return this._thickness;
    }

    public set thickness(value: number) {
        this._thickness = value;
    }


}