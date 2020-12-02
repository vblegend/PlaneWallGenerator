import { Vector2 } from '../../core/Vector2';
import { VectorDesigner } from '../VectorDesigner';


export class Control {

    protected strokeColor: string;
    protected fillColor: string;
    protected hoverColor: string;
    protected opacity: number;
    
    private _designer: VectorDesigner
    private _isHover: boolean;
    private _isSelected: boolean;
    private _id: number;
    private _pressedTime: number;
    private _position: Vector2;
    private _hDragTimer: number;
    private _draging: boolean;
    protected dragDelayTime: number;


    public get position(): Vector2 {
        return this._position;
    }

    public get id(): number {
        return this._id;
    }

    public set id(value: number) {
        this._id = value;
    }

    public get isPressed(): boolean {
        return this._pressedTime != null;
    }


    public get isDraging(): boolean {
        return this._draging;
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
        this._position = new Vector2();
        this.dragDelayTime = 0;
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

    /**
     * render 
     */
    public render() {

    }


    /**
     * mouse move enter
     */
    protected onMouseEnter() {
        this._isHover = true;
        this.designer.requestRender();
    }

    /**
     * mouse move leave
     */
    protected onMouseLeave() {
        this._isHover = false;
        this.designer.requestRender();
    }

    /**
     * mouse button down
     * @param button 
     * @param pos 
     */
    protected onMouseDown(button: number, pos: Vector2) {
        this._pressedTime = new Date().getTime();
        if (button === 0) {
            this._hDragTimer = window.setTimeout(() => {
                this._hDragTimer = null;
                if (this.designer.viewControl.hitObject == this) {
                    this._draging = true;
                    this.onBeginDrag(pos);
                }
            }, this.dragDelayTime);
        }
    }

    /**
     * mouse move
     * @param button 
     * @param pos 
     */
    protected onMouseMove(button: number, pos: Vector2) {
        if (this._draging) {
            this.onDraging(pos);
        }
    }

    /**
     * mouse button up
     * @param button 
     * @param pos 
     */
    protected onMouseUp(button: number, pos: Vector2) {
        this._pressedTime = null;
        if (this._hDragTimer) {
            window.clearTimeout(this._hDragTimer);
            this._hDragTimer = null;
        }
        if (this._draging) {
            this._draging = false;
            this.onEndDrag(pos);
        }
    }



    /**
     * drag be initiated
     * @param canvasPosition 
     */
    protected onBeginDrag(canvasPosition: Vector2) {

    }

    /**
     * drag moveing
     * @param canvasPosition 
     */
    protected onDraging(canvasPosition: Vector2) {

    }

    /**
     * drag the end
     * @param canvasPosition 
     */
    protected onEndDrag(canvasPosition: Vector2) {

    }


    /**
     * mouse click
     */
    protected onClick() {

    }


    /**
     * object select state changed
     * @param value 
     */
    public selectedUpdate(value: boolean) {
        this._isSelected = value;
        this.opacity = value ? 1 : 0.5;
    }


    /**
     * mouse hover in self
     */
    protected get isHover(): boolean {
        return this._isHover;
    }

    public dispatchEvents(event: string, ...params: any[]) {
        this[event] && this[event].apply(this, params);
    }

    /**
     * self is select state
     */
    public get isSelected(): boolean {
        return this._isSelected;
    }
}