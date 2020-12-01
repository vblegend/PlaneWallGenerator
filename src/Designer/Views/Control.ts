import { Vector2 } from '../../core/Vector2';
import { VectorDesigner } from '../VectorDesigner';


export class Control {

    private _designer: VectorDesigner
    public strokeColor: string;
    public fillColor: string;
    public hoverColor: string;
    public opacity: number;
    private _isHover: boolean;
    private _isSelected: boolean;
    private _id: number;

    public get id(): number {
        return this._id;
    }
    public set id(value: number) {
        this._id = value;
    }

    public constructor(designer: VectorDesigner) {
        this._designer = designer;
        this._isHover = false;
        this.hoverColor = '#ff8888';
        this.opacity = 0.5;
        this._isSelected = false;
    }


    public get points(): Vector2[] {
        return [];
    }

    public remove() {
        this.designer.remove(this);
    }

    protected get designer(): VectorDesigner {
        return this._designer;
    }

    public hit(point: Vector2): boolean {
        return true;
    }

    public update() {
    }


    public render() {

    }


    protected onMouseEnter() {
        this._isHover = true;
    }

    protected onMouseLeave() {
        this._isHover = false;
    }


    protected onMouseDown(button: number, pos: Vector2) {

    }
    protected onMouseMove(button: number, pos: Vector2) {

    }
    protected onMouseUp(button: number, pos: Vector2) {

    }


    protected onClick() {

    }

    public selectedUpdate(value: boolean) {
        this._isSelected = value;
        this.opacity = value ? 1 : 0.5;
    }


    protected get isHover(): boolean {
        return this._isHover;
    }


    public getCenter(): Vector2 {
        return new Vector2();
    }


    public dispatchEvents(event: string, ...params: any[]) {
        this[event] && this[event].apply(this, params);
    }

    public get isSelected(): boolean {
        return this._isSelected;
    }
}