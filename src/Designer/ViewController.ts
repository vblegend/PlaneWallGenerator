import * as signals from "signals";
import { Vector2 } from "../Core/Vector2";
import { VectorDesigner } from "./VectorDesigner";
import { AnchorControl } from './Views/AnchorControl';
import { Control } from "./Views/Control";
import { MouseCapturer } from './Utility/MouseCapturer';
import { WallControl } from './Views/WallControl';
import { HoleControl } from "./Views/HoleControl";
import { Connector } from "./Common/Connector";
import { DragService } from "./Plugins/DragService";


export class ViewController {
    private designer: VectorDesigner;
    private _dragging: boolean;
    public position: Vector2;
    private _press_position: Vector2;
    private _hoverObject: Control;
    private _hitObject: Control;
    // private pressed_state: boolean;
    private _pressedObject: Control;
    private _iscanceled: boolean;
    private capturer: MouseCapturer;
    private _button: number;
    public _altState: boolean;
    private dragService: DragService;

    public get alt(): boolean {
        return this._altState;
    }

    public get button(): number {
        return this._button;
    }
    public constructor(designer: VectorDesigner) {
        this.designer = designer;
        this._iscanceled = false;
        this._button = null;
        this.position = new Vector2(-1, -1);
        this.capturer = new MouseCapturer(this.designer.renderer.canvas);
        this.capturer.onMouseDown.add(this.mouse_down, this);
        this.capturer.onMouseMove.add(this.mouse_move, this);
        this.capturer.onMouseUp.add(this.mouse_up, this);
        this.designer.renderer.canvas.onwheel = this.wheelChange.bind(this);
        this.designer.renderer.canvas.onscroll = this.wheelChange.bind(this);
        this.designer.renderer.canvas.onkeydown = this.key_down.bind(this);
        this.designer.renderer.canvas.onkeyup = this.key_up.bind(this);
        //   window.addEventListener('keydown', this.key_down, true);
        this.designer.renderer.canvas.oncontextmenu = (e) => {
            e.preventDefault();
        }
        this.dragService = new DragService(this.designer.renderer.canvas);
        this.dragService.onDropEnter.add(this.control_dragEnter, this);
        this.dragService.onDropLeave.add(this.control_dragLeave, this);
        this.dragService.onDrop.add(this.control_drag, this);
        this.dragService.onDropOver.add(this.control_dragOver, this);

    }

    private addedObject: Control;
    private control_dragEnter(e: DragEvent) {
        this.position = new Vector2(e.pageX - this.designer.renderer.canvas.offsetLeft, e.pageY - this.designer.renderer.canvas.offsetTop);
        let viewPosition = this.designer.mapPoint(this.position);
        if (e.dataTransfer.types.indexOf('text/create-anchor') >= 0) {
            this.dragService.allowedPutDown = true;
            this.addedObject = this.designer.createAnchor(null, viewPosition.x, viewPosition.y);
        } else if (e.dataTransfer.types.indexOf('text/create-door') >= 0) {
            this.dragService.allowedPutDown = true;
            this.addedObject = this.designer.createHole(null, viewPosition.x, viewPosition.y);
        }
        if (this.addedObject) {
            this.designer.add(this.addedObject);
            this._pressedObject = this._hitObject = this.addedObject;
            // mouse down
            this.designer.toolbar.visible = false;
            this._pressedObject.dispatchEvents('onMouseDown', e.button, this.position);
            this.designer.requestRender();
        }
    }

    private control_dragLeave(e: DragEvent) {
        if (this.addedObject) {
            this.designer.remove(this.addedObject);
            this.addedObject = null;
            this._pressedObject = null;
            this.designer.cursor.update(null);
            this.designer.toolbar.visible = this.designer.selected != null && this.designer.connector == null;
            this.designer.requestRender();
        }
    }
    private control_drag(e: DragEvent) {
        this.position = new Vector2(e.pageX - this.designer.renderer.canvas.offsetLeft, e.pageY - this.designer.renderer.canvas.offsetTop);
        this._pressedObject.dispatchEvents('onMouseUp', e.button, this.position);
        this._pressedObject = null;
        this.designer.selected = this.addedObject;
        this.addedObject = null;
        this.designer.requestRender();
    }


    private control_dragOver(e: DragEvent) {
        if (this.addedObject.isDraging) {
            this.mouse_move(e);
            this.designer.requestRender();
        }
    }




    public get hitObject(): Control {
        return this._hitObject;
    }

    public dispose() {
        this.designer.renderer.canvas.onwheel = null;
        this.designer.renderer.canvas.onscroll = null;
        this.designer.renderer.canvas.ondblclick = null;
        this.designer.renderer.canvas.onkeydown = null;
        this.designer.renderer.canvas.onkeyup = null;
        if (this.dragService) {
            this.dragService.dispose();
            this.dragService = null;
        }

    }

    private key_down(e: KeyboardEvent) {
        if (e.key === 'Alt') {
            if (!this._altState) {
                this._altState = true;
                this.designer.requestRender();
                e.preventDefault();
            }
        }

        let moveValue = e.shiftKey ? 10 : 1;
        let center: Vector2;
        const keycode = e.key.toLowerCase();
        if (keycode === 's') center = this.designer.center.clone().reduce(null, -moveValue);
        if (keycode === 'w') center = this.designer.center.clone().reduce(null, +moveValue);
        if (keycode === 'd') center = this.designer.center.clone().reduce(-moveValue, null);
        if (keycode === 'a') center = this.designer.center.clone().reduce(+moveValue, null);
        if (center) {
            this.designer.moveTo(null, center);
            this.designer.onMoved.dispatch();
        }
    }

    private key_up(e: KeyboardEvent) {
        if (e.key === 'Alt') {
            this._altState = false;
            this.designer.requestRender();
            e.preventDefault();
        }
        this.capturer.focus();
    }




    private wheelChange(e: WheelEvent) {
        var deltalX = this.designer.width / 2 - e.offsetX;
        var deltalY = this.designer.height / 2 - e.offsetY;
        var px = new Vector2(e.offsetX, e.offsetY);
        //计算缩放的中心点
        var zoomPoint = new Vector2((px.x + this.designer.bounds.left / this.designer.res) * this.designer.res, (px.y + this.designer.bounds.top / this.designer.res) * this.designer.res);
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
        this.designer.moveTo(zoom, center);
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
        this.capturer.capture();
        this.capturer.focus();
        this._button = e.button;
        if (this.designer.connector != null) {
            if (e.button === 2) {
                this.designer.connector.cancel();
                this.designer.connector = null;
                this._iscanceled = true;
                this.designer.cursor.update(null);
                this.designer.toolbar.visible = true;
            } else if (e.button === 0) {
                if (this.designer.connector.commit(this.hitObject, this.position)) {
                    var newAnchor = this.designer.connector.newAnchor;
                    this.designer.connector = new Connector(this.designer, newAnchor);
                    this.designer.toolbar.visible = false;
                    this.mouse_move(e);
                }
            }
            return;
        }
        this.designer.toolbar.visible = false;
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


    private testhitObject(children: Control[], v: Vector2, excluded?: Control[]): Control {
        for (var i = children.length - 1; i >= 0; i--) {
            var control = children[i];
            if (control.hit(v)) {
                if (excluded != null && excluded.length > 0) {
                    if (excluded.indexOf(control) > -1) continue;
                }
                let child = this.testhitObject(control.children, v, excluded);
                if (child) {
                    return child;
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

        if (this._pressedObject instanceof HoleControl) {
            excluded.push(this._pressedObject);
        } else if (this._pressedObject instanceof AnchorControl) {
            excluded.push(this._pressedObject);
            excluded = excluded.concat(this._pressedObject.walls);
        } else if (this._pressedObject instanceof WallControl) {

        }

        this._hitObject = this.testhitObject(this.designer.children, v, excluded);
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
            this.designer.moveTo(this.designer.zoom, center);
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
        this.capturer.focus();
        this._button = null;
        // if (this.designer.selected == null) {

        // }
        this.designer.toolbar.visible = this.designer.selected != null && this.designer.connector == null;
        this.capturer.release();
        if (this._iscanceled) {
            this._iscanceled = false;
            return;
        }
        //  this.designer.toolbar.visible = this.pressed_state;
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