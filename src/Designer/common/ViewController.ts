import * as signals from "signals";
import { Vector2 } from "../../core/Vector2";
import { VectorDesigner } from "../VectorDesigner";


export class ViewController {
    private designer: VectorDesigner;
    private _dragging: boolean;
    private _onmove: signals.Signal;
    public position: Vector2;


    public get onmove(): signals.Signal {
        return this._onmove;
    }






    public constructor(designer: VectorDesigner) {
        this.designer = designer;
        this._onmove = new signals.Signal();
        this.position = new Vector2(-1, -1);

        this.designer.renderer.canvas.onmousedown = this.mouse_down.bind(this);
        this.designer.renderer.canvas.onmousemove = this.mouse_move.bind(this);
        this.designer.renderer.canvas.onmouseup = this.mouse_up.bind(this);
        this.designer.renderer.canvas.onwheel = this.wheelChange.bind(this);
        this.designer.renderer.canvas.onscroll = this.wheelChange.bind(this);
        this.designer.renderer.canvas.oncontextmenu = (e) => {
            e.preventDefault();
        }
    }


    public dispose() {
        this.designer.renderer.canvas.onwheel = null;
        this.designer.renderer.canvas.onscroll = null;
        this.designer.renderer.canvas.onmousedown = null;
        this.designer.renderer.canvas.onmousemove = null;
        this.designer.renderer.canvas.onmouseup = null;
    }









    private wheelChange(e: WheelEvent) {
        var delta = (-e.deltaY / 1000) * 500;
        var deltalX = this.designer.width / 2 - e.offsetX;
        var deltalY = this.designer.height / 2 - e.offsetY;
        var px = new Vector2(e.offsetX, e.offsetY);
        //计算缩放的中心点
        var zoomPoint = new Vector2((px.x + this.designer.bounds.left / this.designer.res) * this.designer.res, (px.y + this.designer.bounds.top / this.designer.res) * this.designer.res);
        var zoom = this.designer.zoom + delta;
        console.log(zoom);

        var newRes = 1 / (zoom / 100);
        var center = new Vector2(zoomPoint.x + deltalX * newRes, zoomPoint.y + deltalY * newRes);
        this.onmove.dispatch(zoom, center, false);
        this.stopEventBubble(e);
    }

    private stopEventBubble(e: UIEvent) {
        if (e.preventDefault) {
            e.preventDefault();
        } else {
            e.returnValue = false;
        }

        if (e && e.stopPropagation)
            e.stopPropagation();
        else
            window.event.cancelBubble = true;
    }



    private mouse_down(e: MouseEvent) {
        this._press_x = e.offsetX;
        this._press_y = e.offsetY;
        //if (e.button == 0) {
        this._dragging = true;
        this.stopEventBubble(e);
        this.designer.renderer.canvas.style.cursor = "move";
        this.captureMouse();
        // }
    }

    private mouse_move(e: MouseEvent) {
        this.position = new Vector2(e.pageX - this.designer.renderer.canvas.offsetLeft, e.pageY - this.designer.renderer.canvas.offsetTop);
        if (this._dragging) {
            var dx = this.position.x - this._press_x;
            var dy = this.position.y - this._press_y;
            this._press_x = this.position.x;
            this._press_y = this.position.y;
            var center = new Vector2(this.designer.center.x - dx * this.designer.res, this.designer.center.y - dy * this.designer.res);
            this.onmove.dispatch(this.designer.zoom, center, true);
        } else {
            var dx: number = e.offsetX;
            var dy: number = e.offsetY;
            // this.event_callback(new Point(dx, dy), e.buttons, MouseEvents.MouseMove);
        }
        this.stopEventBubble(e);
    }

    private mouse_up(e: MouseEvent) {
        this.releaseMouse();
        this.position = new Vector2(e.pageX - this.designer.renderer.canvas.offsetLeft, e.pageY - this.designer.renderer.canvas.offsetTop);
        this._dragging = false;
        this.stopEventBubble(e);
        this.designer.renderer.canvas.style.cursor = "default";
        document.onmouseup = null;
    }

    private _press_x: number;
    private _press_y: number;



    private captureMouse() {
        if (!this._captureing) {
            this.designer.renderer.canvas.onmousemove = null;
            this.designer.renderer.canvas.onmouseup = null;
            this._document_mousemoveHandle = document.onmousemove;
            this._document_mouseupHandle = document.onmouseup;
            document.onmousemove = this.mouse_move.bind(this);;
            document.onmouseup = this.mouse_up.bind(this);
            this._captureing = true;
        }
    }


    private releaseMouse() {
        if (this._captureing) {
            document.onmousemove = this._document_mousemoveHandle;
            document.onmouseup = this._document_mouseupHandle;
            this._captureing = false;
            this.designer.renderer.canvas.onmousemove = this.mouse_move.bind(this);
            this.designer.renderer.canvas.onmouseup = this.mouse_up.bind(this);
        }
    }


    private _captureing: boolean;
    private _document_mousemoveHandle: (MouseEvent) => void;
    private _document_mouseupHandle: (MouseEvent) => void;



}