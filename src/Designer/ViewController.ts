import * as signals from "signals";
import { Vector2 } from "../core/Vector2";
import { VectorDesigner } from "./VectorDesigner";
import { Control } from "./Views/Control";


export class ViewController {
    private designer: VectorDesigner;
    private _dragging: boolean;
    private _onmove: signals.Signal;
    public position: Vector2;
    private _press_position: Vector2;
    private _hoverObject: Control;
    private pressed_state: boolean;
    private _pressedObject: Control;
    private _iscanceled: boolean;

    public get onmove(): signals.Signal {
        return this._onmove;
    }

    public constructor(designer: VectorDesigner) {
        this.designer = designer;
        this._iscanceled = false;
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
        // var delta = (-e.deltaY / 1000) * 500;
        var deltalX = this.designer.width / 2 - e.offsetX;
        var deltalY = this.designer.height / 2 - e.offsetY;
        var px = new Vector2(e.offsetX, e.offsetY);
        //计算缩放的中心点
        var zoomPoint = new Vector2((px.x + this.designer.bounds.left / this.designer.res) * this.designer.res, (px.y + this.designer.bounds.top / this.designer.res) * this.designer.res);
        var zoom = 0; // this.designer.zoom + delta;
        {
            var scales = [50, 100, 200, 250, 400, 500, 800, 1000, 1250, 2000, 2500, 3000, 4000];
            var index = scales.indexOf(this.designer.zoom);
            if (index == -1) {
                index = 1;
            } else {
                if (e.deltaY < 0) {
                    index = Math.min(index + 1, scales.length - 1);
                } else {
                    index = Math.max(index - 1, 0);
                }
            }
            zoom = scales[index];
        }
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
        this.captureMouse();
        this._iscanceled = false;
        if (e.button == 2) {
            if (this.designer.selected != null) {
                this.designer.selected = null;
                this._iscanceled = true;
                return;
            }
        }

        if (this._hoverObject) {
            this._pressedObject = this._hoverObject;
            // mouse down
            this._hoverObject.dispatchEvents('onMouseDown');
            return;
        }
        this._press_position = this.position;
        this._dragging = true;
        this.stopEventBubble(e);
        this.designer.renderer.canvas.style.cursor = "move";

        this.pressed_state = this.designer.toolbar.visible;
        if (this.pressed_state) {
            this.designer.toolbar.visible = false;
        }
    }

    private mouse_move(e: MouseEvent) {
        if (this._iscanceled) return;
        this.position = new Vector2(e.pageX - this.designer.renderer.canvas.offsetLeft, e.pageY - this.designer.renderer.canvas.offsetTop);
        if (this._dragging) {
            var pos = this.position.sub(this._press_position);
            this._press_position = this.position;
            var center = new Vector2(this.designer.center.x - pos.x * this.designer.res, this.designer.center.y - pos.y * this.designer.res);
            this.onmove.dispatch(this.designer.zoom, center, true);
            this.stopEventBubble(e);
        }


        let v = this.designer.mapPoint(this.position);
        if (this._hoverObject != null && this._hoverObject.hit(v)) {
            this._hoverObject.dispatchEvents('onMouseMove');
            return;
        }
        for (var i = this.designer.children.length - 1; i >= 0; i--) {
            var control = this.designer.children[i];
            if (control.hit(v) && this._hoverObject != control) {
                if (this._hoverObject != null) {
                    // leave
                    this._hoverObject.dispatchEvents('onMouseLeave');
                    this._hoverObject = null;
                }
                this._hoverObject = control;
                if (this._hoverObject != null) {
                    // enter
                    this._hoverObject.dispatchEvents('onMouseEnter');
                    // move
                    this._hoverObject.dispatchEvents('onMouseMove');
                }
                return;
            }
        }
        if (this._hoverObject != null) {
            // leave
            this._hoverObject.dispatchEvents('onMouseLeave');
            this._hoverObject = null;
        }



    }

    private mouse_up(e: MouseEvent) {
        if (this._iscanceled) {
            this._iscanceled = false;
            return;
        }
        if (this._pressedObject) {
            // mouse down
            this._pressedObject.dispatchEvents('onMouseUp');
            if (this._pressedObject === this._hoverObject) {
                // click
                this._hoverObject.dispatchEvents('onClick');
            }
            this._pressedObject = null;
            return;
        }
        this.releaseMouse();
        this.position = new Vector2(e.pageX - this.designer.renderer.canvas.offsetLeft, e.pageY - this.designer.renderer.canvas.offsetTop);
        this._dragging = false;
        this.stopEventBubble(e);
        this.designer.renderer.canvas.style.cursor = "default";
        document.onmouseup = null;
        this.designer.toolbar.visible = this.pressed_state;
    }





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