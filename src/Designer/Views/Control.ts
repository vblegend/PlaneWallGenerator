import { Vector2 } from '../../Core/Vector2';
import { VectorDesigner } from '../VectorDesigner';
import { WallControl } from './WallControl';

export class ControlDragEvent {

    private _button: number;
    private _position: Vector2;
    private _viewPos: Vector2;
    private _offset: Vector2;




    public constructor() {
        this._button = null;
        this._position = new Vector2();
        this._viewPos = new Vector2();
        this._offset = new Vector2();
    }




    /**
     * 响应的鼠标按键
     */
    public get button(): number {
        return this._button;
    }

    /**
     * 鼠标在canvas中位置
     */
    public get position(): Vector2 {
        return this._position;
    }

    /**
     * 鼠标在视图中的位置
     */
    public get viewPos(): Vector2 {
        return this._viewPos;
    }

    /**
     * 响应拖动事件时鼠标位于对象的偏移位置
     */
    public get offset(): Vector2 {
        return this._offset;
    }









    public init(canvasPosition: Vector2, viewPosition: Vector2, dragOffset?: Vector2, button?: number) {
        if (canvasPosition) this._position.copy(canvasPosition);
        if (viewPosition) this._viewPos.copy(viewPosition);
        if (dragOffset) this._offset.copy(dragOffset);
        if (button != null) this._button = button;
    }


}




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
    private _ControlDragEvent: ControlDragEvent;
    private _actived: boolean;
    public children: Control[];

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
        this._actived = false;
        this.opacity = 0.5;
        this._isSelected = false;
        this._position = new Vector2();
        this.dragDelayTime = 0;
        this._ControlDragEvent = new ControlDragEvent;
        this.children = [];
    }

    public onLoad() {
        this._actived = true;
    }

    public onUnLoad() {
        this._actived = false;
    }

    public get loaded():boolean{
        return this._actived;
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
    protected onMouseDown(button: number, canvasPos: Vector2) {
        this._pressedTime = new Date().getTime();
        if (button === 0) {
            this._hDragTimer = window.setTimeout(() => {
                this._hDragTimer = null;
                if (this.designer.viewControl.hitObject == this) {
                    this._draging = true;
                    var viewPos = this.designer.mapPoint(canvasPos);
                    this._ControlDragEvent.init(canvasPos, viewPos, viewPos.sub(this.position), button);
                    this.onBeginDrag(this._ControlDragEvent);
                }
            }, this.dragDelayTime);
        }
    }

    /**
     * mouse move
     * @param button 
     * @param pos 
     */
    protected onMouseMove(button: number, canvasPos: Vector2) {
        if (this._draging) {
            var viewPos = this.designer.mapPoint(canvasPos);
            this._ControlDragEvent.init(canvasPos, viewPos, null);
            this.onDraging(this._ControlDragEvent);
        }
    }

    /**
     * mouse button up
     * @param button 
     * @param pos 
     */
    protected onMouseUp(button: number, canvasPos: Vector2) {
        this._pressedTime = null;
        if (this._hDragTimer) {
            window.clearTimeout(this._hDragTimer);
            this._hDragTimer = null;
        }
        if (this._draging) {
            this._draging = false;
            var viewPos = this.designer.mapPoint(canvasPos);
            this._ControlDragEvent.init(canvasPos, viewPos, null);
            this.onEndDrag(this._ControlDragEvent);
        }
    }







    /**
     * drag be initiated
     * @param canvasPosition 
     */
    protected onBeginDrag(e: ControlDragEvent) {

    }

    /**
     * drag moveing
     * @param canvasPosition 
     */
    protected onDraging(e: ControlDragEvent) {

    }

    /**
     * drag the end
     * @param canvasPosition 
     */
    protected onEndDrag(e: ControlDragEvent) {

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