import { Anchor } from "./Anchor";
import { Vector2 } from "./Vector2";

export class Segment {
    public id: number;
    private _thickness: number;
    private _start: Anchor;
    private _end: Anchor;
    private _points: Vector2[][];


    public dispose() {
        this.remove();
        if (this._points) {
            this._points.length = 0;
            this._points = null;
        }
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
        var arry: number[][] = [];
        for (var o of this._points[0]) {
            arry.push([o.x, o.y]);
        }
        for (var o of this._points[1]) {
            arry.push([o.x, o.y]);
        }
        return arry;
    }


    public getPort(anchor: Anchor): Vector2[] {
        if (this._start === anchor)
            return this._points[0];
        else
            return this._points[1];
    }

    public constructor(start: Anchor, end: Anchor, thickness: number) {
        this._start = start;
        this._end = end;
        this._thickness = thickness;
        this._points = [];
        this._points.push([], []);
        this._start.addTarget(this._end, this);
        this._end.addTarget(this._start, this);
    }

    public get thickness(): number {
        return this._thickness;
    }

    public set thickness(value: number) {
        this._thickness = value;
    }


}