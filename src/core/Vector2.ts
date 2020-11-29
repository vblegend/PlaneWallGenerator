export class Vector2 {
    public constructor(_x?: number, _y?: number) {
        this.x = _x ? _x : 0;
        this.y = _y ? _y : 0;
    }
    x: number;
    y: number;
}