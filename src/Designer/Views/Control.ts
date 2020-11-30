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



    public id: number;
    public constructor(designer: VectorDesigner) {
        this._designer = designer;
        this.id = 111;
        this._isHover = false;
        this.hoverColor = '#ff8888';
        this.opacity = 0.5;
    }

    public dispose() {
        this._designer = null;
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


    public dispatchEvents(event: string) {
        this[event] && this[event]();
    }

    public get isSelected(): boolean {
        return this._isSelected;
    }
}