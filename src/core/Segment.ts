import { Adorner } from "./Adorner";
import { Vector2 } from "./Vector2";

export class Segment {
    private _thickness: number;
    private _start: Adorner;
    private _points: Vector2[][];


    public dispose() {
        this._start = null;
        this._points.length = 0;
        this._points = null;
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


    public getPort(adorner: Adorner): Vector2[] {
        if (this._start === adorner)
            return this._points[0];
        else
            return this._points[1];
    }

    public constructor(start: Adorner, end: Adorner, thickness: number) {
        this._start = start;
        this._thickness = thickness;
        this._points = [];
        this._points.push([], [])
        start.addTarget(end, this);
        end.addTarget(start, this);
    }

    public get thickness(): number {
        return this._thickness;
    }

}