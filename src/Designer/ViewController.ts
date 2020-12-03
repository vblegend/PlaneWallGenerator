import * as signals from "signals";
import { Vector2 } from "../Core/Vector2";
import { VectorDesigner } from "./VectorDesigner";
import { AnchorControl } from "./Views/AnchorControl";
import { Control } from "./Views/Control";
import { MouseCapturer } from './Utility/MouseCapturer';
import { PolygonControl } from './Views/PolygonControl';


export class ViewController {
    private designer: VectorDesigner;
    private _dragging: boolean;
    private _onmove: signals.Signal;
    public position: Vector2;
    private _press_position: Vector2;
    private _hoverObject: Control;
    private _hitObject: Control;
    private pressed_state: boolean;
    private _pressedObject: Control;
    private _iscanceled: boolean;
    private capturer: MouseCapturer;

    public get onmove(): signals.Signal {
        return this._onmove;
    }

    public constructor(designer: VectorDesigner) {
        this.designer = designer;
        this._iscanceled = false;
        this._onmove = new signals.Signal();
        this.position = new Vector2(-1, -1);
        this.capturer = new MouseCapturer(this.designer.renderer.canvas);
        this.capturer.onMouseDown.add(this.mouse_down, this);
        this.capturer.onMouseMove.add(this.mouse_move, this);
        this.capturer.onMouseUp.add(this.mouse_up, this);
        this.designer.renderer.canvas.ondblclick = this.mouse_dblclick.bind(this);
        // this.designer.renderer.canvas.onmousedown = this.mouse_down.bind(this);
        // this.designer.renderer.canvas.onmousemove = this.mouse_move.bind(this);
        // this.designer.renderer.canvas.onmouseup = this.mouse_up.bind(this);
        this.designer.renderer.canvas.onwheel = this.wheelChange.bind(this);
        this.designer.renderer.canvas.onscroll = this.wheelChange.bind(this);
        this.designer.renderer.canvas.oncontextmenu = (e) => {
            e.preventDefault();
        }
    }

    public get hitObject(): Control {
        return this._hitObject;
    }

    public dispose() {
        this.designer.renderer.canvas.onwheel = null;
        this.designer.renderer.canvas.onscroll = null;
        // this.designer.renderer.canvas.onmousedown = null;
        // this.designer.renderer.canvas.onmousemove = null;
        // this.designer.renderer.canvas.onmouseup = null;
        this.designer.renderer.canvas.ondblclick = null;
    }

    private wheelChange(e: WheelEvent) {
        //  var delta = (-e.deltaY / 1000) * 50;
        var deltalX = this.designer.width / 2 - e.offsetX;
        var deltalY = this.designer.height / 2 - e.offsetY;
        var px = new Vector2(e.offsetX, e.offsetY);
        //计算缩放的中心点
        var zoomPoint = new Vector2((px.x + this.designer.bounds.left / this.designer.res) * this.designer.res, (px.y + this.designer.bounds.top / this.designer.res) * this.designer.res);
        //  var zoom =  this.designer.zoom + delta;
        var zoom = 0;
        {
            var scales = [5, 10, 20, 25, 40, 50, 80, 100, 200, 250, 400, 500, 800, 1000, 1250, 2000, 2500, 3000, 4000];
            var index = scales.indexOf(this.designer.zoom);
            if (index === -1) {
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

    private mouse_dblclick(e: MouseEvent) {
        if (this.hitObject instanceof AnchorControl) {
            return;
        }
        if (this.hitObject instanceof PolygonControl) {
            var anchor = this.hitObject.split(this.position);
            this.designer.selected = anchor;
            return;
        }
        if (this.designer.selected == null) {
            let v = this.designer.mapPoint(this.position);
            var anchor = this.designer.createAnchor(null, v.x, v.y);
            this.designer.add(anchor);
            this.designer.selected = anchor;
        }

    }




    private mouse_down(e: MouseEvent) {
        this.capturer.capture();
        this.pressed_state = this.designer.toolbar.visible;
        if (this.pressed_state) {
            this.designer.toolbar.visible = false;
        }
        if (this.designer.connector != null) {
            if (e.button === 2) {
                this.designer.connector.cancel();
                this.designer.toolbar.visible = true;
            }
            if (e.button === 0) {
                this.designer.connector.commit(this.hitObject, this.position);
            }
            this.designer.connector = null;
            this._iscanceled = true;
            this.designer.virtualCursor = null;
            return;
        }

        this._iscanceled = false;
        if (e.button === 2) {
            if (this.designer.selected != null) {
                this.designer.selected = null;
                this._iscanceled = true;
                return;
            }
        }

        if (this._hoverObject) {
            this._pressedObject = this._hoverObject;
            // mouse down
            this._pressedObject.dispatchEvents('onMouseDown', e.button, this.position);
            return;
        }

        this._press_position = this.position;
        this._dragging = true;
        this.stopEventBubble(e);
        this.designer.renderer.canvas.style.cursor = "move";
    }


    private testhitObject(v: Vector2, excluded?: Control[]): Control {
        for (var i = this.designer.children.length - 1; i >= 0; i--) {
            var control = this.designer.children[i];
            if (control.hit(v)) {
                if (excluded != null && excluded.length > 0) {
                    if (excluded.indexOf(control) > -1) continue;
                }
                return control;
            }
        }
        return null;
    }



    private mouse_move(e: MouseEvent) {
        if (this._iscanceled) return;

        let v = this.designer.mapPoint(this.position);
        var excluded: Control[] = [];
        if (this._pressedObject instanceof AnchorControl) {
            excluded.push(this._pressedObject);
            excluded = excluded.concat(this._pressedObject.polygons);
        } else if (this._pressedObject instanceof PolygonControl) {

        }

        this._hitObject = this.testhitObject(v, excluded);
        this.position = new Vector2(e.pageX - this.designer.renderer.canvas.offsetLeft, e.pageY - this.designer.renderer.canvas.offsetTop);
        if (this.designer.connector != null) {
            this.designer.connector.update(this.position, this._hitObject);
            return;
        }
        if (this._pressedObject) {
            this._pressedObject.dispatchEvents('onMouseMove', e.button, this.position);
            return;
        }

        if (this._dragging) {
            var pos = this.position.sub(this._press_position);
            this._press_position = this.position;
            var center = new Vector2(this.designer.center.x - pos.x * this.designer.res, this.designer.center.y - pos.y * this.designer.res);
            this.onmove.dispatch(this.designer.zoom, center, true);
            this.stopEventBubble(e);
        }

        if (this._hitObject !== this._hoverObject) {
            if (this._hoverObject != null) {
                this._hoverObject.dispatchEvents('onMouseLeave');
            }
            this._hoverObject = this._hitObject;
            if (this._hoverObject != null) {
                this._hoverObject.dispatchEvents('onMouseEnter');
                this._hoverObject.dispatchEvents('onMouseMove', e.button, this.position);
            }
        } else if (this._hoverObject != null) {
            this._hoverObject.dispatchEvents('onMouseMove', e.button, this.position);
        }
    }















    private mouse_up(e: MouseEvent) {
        if (this.designer.selected == null) {
            this.designer.toolbar.visible = false;
        }
        this.capturer.release();
        if (this._iscanceled) {
            this._iscanceled = false;
            return;
        }
        this.designer.toolbar.visible = this.pressed_state;
        if (this._pressedObject) {
            // mouse down
            this._pressedObject.dispatchEvents('onMouseUp', e.button, this.position);
            if (this._pressedObject === this._hoverObject) {
                // click
                this._hoverObject.dispatchEvents('onClick');
            }
            this._pressedObject = null;
            return;
        }
        if (this._dragging) {
            this.position = new Vector2(e.pageX - this.designer.renderer.canvas.offsetLeft, e.pageY - this.designer.renderer.canvas.offsetTop);
            this._dragging = false;
            this.stopEventBubble(e);
            this.designer.renderer.canvas.style.cursor = "default";
        }
    }








}