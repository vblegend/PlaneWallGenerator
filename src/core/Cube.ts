import { Vector2 } from './Vector2';

export class Cube {
    public id: number;
    public position: Vector2;
    public length: number;
    public width: number;
    public height: number;
    private _vertices: number[][];


    public constructor(id: number, x: number, y: number, length: number, width: number, height: number) {
        this.id = id;
        this.position = new Vector2(x, y);
        this.length = length;
        this.width = width;
        this.height = height;
        this._vertices = [];
        this.update();
    }



    public update() {
        const w = this.length / 2;
        const h = this.width / 2;
        this._vertices = [];
        this._vertices.push([this.position.x - w, this.position.y - h]);
        this._vertices.push([this.position.x + w, this.position.y - h]);
        this._vertices.push([this.position.x + w, this.position.y + h]);
        this._vertices.push([this.position.x - w, this.position.y + h]);
    }


    public get vertices(): number[][] {
        return this._vertices;
    }









}