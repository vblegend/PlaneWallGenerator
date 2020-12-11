import { Vector2 } from "./Vector2";

export class Cylinder {

    public id: number;
    public position: Vector2;
    public radius: number;
    public height: number;

    public constructor(id: number, x: number, y: number, radius: number, height: number) {
        this.id = id;
        this.position = new Vector2(x, y);
        this.radius = radius;
        this.height = height;
    }

















}