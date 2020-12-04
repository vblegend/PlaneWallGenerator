import { Anchor } from "./Anchor";
import { Vector2 } from "./Vector2";

export class Segment {
    public id: number;
    private _thickness: number;
    private _start: Anchor;
    private _end: Anchor;
    private _points: Vector2[][];
    private _updated: boolean;




    public constructor(id: number, start: Anchor, end: Anchor, thickness: number) {
        this.id = id;
        this._start = start;
        this._end = end;
        this._thickness = thickness;
        this._points = [];
        this._points.push([new Vector2(), new Vector2(), new Vector2()], [new Vector2(), new Vector2(), new Vector2()]);
        this._start.addTarget(this._end, this);
        this._end.addTarget(this._start, this);
        this._updated = false;
    }

    public dispose() {
        this.remove();
        if (this._points) {
            this._points.length = 0;
            this._points = null;
        }
    }


    /**
     * The points has been updated
     */
    public get pointsUpdated(): boolean {
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


    public get points(): number[][] {
        const arry: number[][] = [];
        for (let i = 0; i < 3; i++) {
            arry[i] = [this._points[0][i].x, this._points[0][i].y];
            arry[i + 3] = [this._points[1][i].x, this._points[1][i].y];
        }
        this._updated = false;
        return arry;
    }




    public getPort(anchor: Anchor): Vector2[] {
        if (this._start === anchor)
            return this._points[0];
        else
            return this._points[1];
    }


    public get thickness(): number {
        return this._thickness;
    }

    public set thickness(value: number) {
        this._thickness = value;
    }


}