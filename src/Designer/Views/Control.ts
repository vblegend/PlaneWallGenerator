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
    private _pressedTime: number;
    protected position:Vector2;

    public get id(): number {
        return this._id;
    }
    public set id(value: number) {
        this._id = value;
    }
    public get isPressed(): boolean {
        return this._pressedTime != null;
    }

    /**
     * 按下到当前的tick
     */
    public get pressedTick(): number {
        if (this._pressedTime == null) return 0;
        return new Date().getTime() - this._pressedTime;
    }



    public constructor(designer: VectorDesigner) {
        this._designer = designer;
        this._isHover = false;
        this._pressedTime = null;
        this.hoverColor = '#ff8888';
        this.opacity = 0.5;
        this._isSelected = false;
        this.position = new Vector2();
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
        this.designer.requestRender();
    }

    protected onMouseLeave() {
        this._isHover = false;
        this.designer.requestRender();
    }


    protected onMouseDown(button: number, pos: Vector2) {
        this._pressedTime = new Date().getTime();
    }
    protected onMouseMove(button: number, pos: Vector2) {
        this.position.copy(pos);
    }
    protected onMouseUp(button: number, pos: Vector2) {
        this._pressedTime = null;
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