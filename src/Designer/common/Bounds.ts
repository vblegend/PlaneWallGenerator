import { Vector2 } from '../../Core/Vector2';

export class Bounds {
    public left: number;
    public top: number;
    public right: number;
    public bottom: number;


    public constructor(left: number, top: number, right: number, bottom: number) {
        this.left = left;
        this.top = top;
        this.right = right;
        this.bottom = bottom;
    }



    public get width(): number {
        return this.right - this.left;
    }

    public get height(): number {
        return this.bottom - this.top;
    }

    public getCenter(): Vector2 {
        return new Vector2(this.left + this.width / 2, this.top + this.height / 2);
    }

    public extend(bounds: Bounds) {
        if (this.left > bounds.left) {
            this.left = bounds.left;
        }
        if (this.top > bounds.top) {
            this.top = bounds.top;
        }
        if (this.bottom < bounds.bottom) {
            this.bottom = bounds.bottom;
        }
        if (this.right < bounds.right) {
            this.right = bounds.right;
        }
    }



    public intersect(bounds: Bounds) {
        var inLeft = (
            ((bounds.left >= this.left) && (bounds.left <= this.right)) || ((this.left >= bounds.left) && (this.left <= bounds.right))
        );
        var inTop = (
            ((bounds.top >= this.top) && (bounds.top <= this.bottom)) || ((this.top > bounds.top) && (this.top < bounds.bottom))
        );
        var inRight = (
            ((bounds.right >= this.left) && (bounds.right <= this.right)) || ((this.right >= bounds.left) && (this.right <= bounds.right))
        );
        var inBottom = (
            ((bounds.bottom >= this.top) && (bounds.bottom <= this.bottom)) || ((this.bottom >= bounds.top) && (this.bottom <= bounds.bottom))
        );
        return ((inBottom || inTop) && (inLeft || inRight));
    }




    public extendFromPoint(point: Vector2) {
        if (this.left > point.x) {
            this.left = point.x;
        }
        if (this.top > point.y) {
            this.top = point.y;
        }
        if (this.bottom < point.y) {
            this.bottom = point.y;
        }
        if (this.right < point.x) {
            this.right = point.x;
        }
    }




    public contains(point: Vector2): boolean {
        return point.x >= this.left &&
            point.x <= this.right &&
            point.y >= this.top &&
            point.y <= this.bottom;
    }


}