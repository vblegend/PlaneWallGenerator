import * as signals from "signals";
import { Vector2 } from "../Core/Vector2";
import { Bounds } from "./Common/Bounds";
import { Renderer } from "./Renderer";
import { Size } from "./Common/Size";
import { ViewController } from "./ViewController";
import { Control } from "./Views/Control";
import { ToolBar } from "./Menus/ToolBar";
import { AnchorControl } from './Views/AnchorControl';
import { PolygonControl } from './Views/PolygonControl';
import { Connector } from "./Common/Connector";
import { AdsorbService } from "./Common/AdsorbService";
import { GroupWalls, WallSegment } from "../Core/WallElement";
import { ImageControl } from "./Views/ImageControl";
import { Cursor } from "./Views/Cursor";


export class VectorDesigner {

    private _isdisposed: boolean;
    private _viewControl: ViewController;
    private _div: HTMLDivElement;
    private _bounds: Bounds;
    private _renderer: Renderer;
    private _zoom: number;
    private _center: Vector2;
    private _res: number;
    private _runState: boolean;
    private _onRender: signals.Signal;
    private _onZoom: signals.Signal;
    private _onCursor: signals.Signal;

    private _cursor:Cursor;

    public _width: number;
    public _height: number;
    public _children: Control[];
    private _toolbar: ToolBar;
    private _selected: Control;

    public connector: Connector;
    private _adsorb: AdsorbService;

    public _mouseGrabObjects: Control[];
    public defaultHeight: number;
    public defaultthickness: number;
    private _requestRender: boolean;
    private _maxSerialNumber: number;

    private _background: ImageControl;


    public get background(): ImageControl {
        return this._background;
    }


    /**
     * 磁性吸附服务
     */
    public get adsorb(): AdsorbService {
        return this._adsorb;
    }

    /**
     * 抓住对象 把对象从子集中拿出来，防止生成磁吸点时把抓住的对象加进去
     * @param objects 
     */
    public grabObjects(objects: Control[]) {
        this.releaseGrabObjects();
        this._adsorb.enabled = false;
        for (let object of objects) {
            if (this.remove(object).length > 0) {
                this._mouseGrabObjects.push(object);
            }
        }
        this._adsorb.enabled = true;
    }

    /**
     * 释放抓住的对象，再把对象放入到子集中去
     */
    public releaseGrabObjects() {
        this._adsorb.enabled = false;
        while (this._mouseGrabObjects.length > 0) {
            var object = this._mouseGrabObjects.shift();
            this.add(object);
        }
        this._adsorb.enabled = true;
    }

    /**
     * 丢弃所有抓住的对象，不再放回子集中
     */
    public discardGrabObjects() {
        this._adsorb.enabled = false;
        while (this._mouseGrabObjects.length > 0) {
            this._mouseGrabObjects.shift();
        }
        this._adsorb.enabled = true;
    }



    public get children(): Control[] {
        return this._children;
    }

    public get toolbar(): ToolBar {
        return this._toolbar;
    }

    public get selected(): Control {
        return this._selected;
    }

    public set selected(value: Control) {
        if (this._selected != value) {
            if (this._selected != null) {
                //
                this._selected.selectedUpdate(false);
                this.toolbar.visible = false;;
            }
            this._selected = value;
            var pt: Vector2 = null;
            if (this._selected instanceof AnchorControl) {
                pt = this.convertPoint(this._selected.point).add(new Vector2(20, 10));
            } else if (this._selected instanceof PolygonControl) {
                pt = this._selected.getSubPoint(this.viewControl.position);
                pt = this.convertPoint(pt).add(new Vector2(20, 10));
            }
            if (pt) {
                this.toolbar.visible = true;
                this._selected.selectedUpdate(true);
                this.toolbar.setPosition(pt);
            }
        }
        this.requestRender();
    }





    public constructor(div: HTMLDivElement) {
        this._div = div;
        this._zoom = 100;
        this._children = [];
        this._mouseGrabObjects = [];
        this._cursor = new Cursor(this);
        this._adsorb = new AdsorbService(this);
        this._onRender = new signals.Signal();
        this._onZoom = new signals.Signal();
        this._onCursor = new signals.Signal();
        this._renderer = new Renderer();
        this._viewControl = new ViewController(this);
        this._runState = false;
        this._renderer.apply(div);
        this.resize();
        this._background = new ImageControl(this);
        this._viewControl.onmove.add(this.moveTo, this);
        this._toolbar = new ToolBar(this);
        this._div.appendChild(this._toolbar.dom);
        this._requestRender = true;
        this.defaultHeight = 100;
        this.defaultthickness = 10;
        this._maxSerialNumber = 0;
    }


    public resize() {
        this._width = this._div.clientWidth;
        this._height = this._div.clientHeight;
        this._renderer.resize(this.width, this.height);
        this._bounds = new Bounds(-this.width / 2, -this.height / 2, this.width / 2, this.height / 2);
        this._center = this._bounds.getCenter();
        this._res = 1 / (this._zoom / 100);
        this.moveTo(this._zoom, this._center);
    }


    private moveTo(zoom: number, center: Vector2, trans: boolean = false) {
        if (zoom <= 0) {
            return;
        }
        if (this._zoom != zoom) {
            this._zoom = zoom;
            this.onZoom.dispatch(zoom);
        }
        //console.log(center);
        if ((this._center != center) || trans) {
            this._center = center;
        }
        this._res = 1 / (this._zoom / 100);
        var width = this.width * this._res;
        var height = this.height * this._res;
        //获取新的视图范围。
        this._bounds = new Bounds(center.x - width / 2, center.y - height / 2, center.x + width / 2, center.y + height / 2);
        //redraw
        this.requestRender();
    }

    public async run() {
        this._runState = true;
        this._requestRender = true;
        await this.graphicRender();
    }

    public updateElementPoints() {
        this._adsorb.update();
    }


    public requestRender() {
        this._requestRender = true;
    }



    public dispose() {
        this.clear();
        this._isdisposed = true;
    }



    private async graphicRender() {
        if (!this._runState || this.isDisposed) return;
        if (this._requestRender) {
            this._requestRender = false;
            this.renderer.clear();
            this._background.render();
            for (var control of this._children) {
                control.render();
            }
            if (this.connector) this.connector.render();

            if (this._mouseGrabObjects.length > 0) {
                for (var control of this._mouseGrabObjects) {
                    control.render();
                }
            }
            this._cursor.render();
            this.onRender.dispatch();
        }
        if (!this.isDisposed && this._runState) {
            //继续下一帧
            requestAnimationFrame(this.graphicRender.bind(this));
        }
    }






    /**
     * 将视图坐标转换为canvas坐标。
     * @param point 
     */
    public convertPoint(point: Vector2): Vector2 {
        var resolution = this.res;
        var extent = this.bounds;
        var x = (point.x / resolution + (-extent.left / resolution));
        var y = (point.y / resolution + (-extent.top / resolution));
        return new Vector2(x, y);
    }

    /**
     * 将canvas坐标转换为 视图坐标
     */
    public mapPoint(point: Vector2): Vector2 {
        var ux = (point.x + this.bounds.left / this.res) * this.res;
        var uy = (point.y + this.bounds.top / this.res) * this.res;
        return new Vector2(ux, uy);
    }

    /**
     * 将视图坐标转换为canvas坐标
     * @param points 
     */
    public convertPoints(points: Vector2[]): Vector2[] {
        var result = [];
        for (let point of points) {
            result.push(this.convertPoint(point));
        }
        return result;
    }

    /**
     * 批量将视图坐标转换为canvas坐标
     * @param points 
     */
    public createAnchor(id: number, x: number, y: number): AnchorControl {
        var x = Number.parseFloat(x.toFixed(4));
        var y = Number.parseFloat(y.toFixed(4));
        if (id == null) {
            for (let anchor of this.children) {
                if (anchor instanceof AnchorControl) {
                    if (anchor.anchor.x === x && anchor.anchor.y === y) {
                        return anchor;
                    }
                }
            }
            id = ++this._maxSerialNumber;
        }
        var anchor = new AnchorControl(this, x, y);
        anchor.id = id;
        if (id >= this._maxSerialNumber) {
            this._maxSerialNumber = id + 1;
        }
        return anchor;
    }

    public createPolygon(id: number, anchor1: AnchorControl, anchor2: AnchorControl, thickness?: number): PolygonControl {
        if (anchor1 == anchor2) return null;
        if (anchor1.anchor.targets.indexOf(anchor2.anchor) > -1) {
            return null;
        }
        if (id && id >= this._maxSerialNumber) {
            this._maxSerialNumber = id + 1;
        } else {
            id = ++this._maxSerialNumber;
        }
        if (thickness == null) thickness = this.defaultthickness;
        var polygon = new PolygonControl(this, id, anchor1, anchor2, thickness);
        polygon.height = this.defaultHeight;
        return polygon;
    }



    public add(...ctls: Control[]) {
        for (let ctl of ctls) {
            if (ctl != null) {
                var index = this.children.indexOf(ctl);
                if (ctl.id && ctl.id >= this._maxSerialNumber) {
                    this._maxSerialNumber = ctl.id + 1;
                }
                if (index == -1) {
                    if (ctl instanceof AnchorControl) {
                        this.children.push(ctl);
                    } else if (ctl instanceof PolygonControl) {
                        this.children.unshift(ctl);
                    }
                }
            }
        }
        this.requestRender();
        this._adsorb.update();
    }


    public remove(...ctls: Control[]): Control[] {
        let result = [];
        for (let ctl of ctls) {
            var index = this.children.indexOf(ctl);
            if (index > -1) {
                result.push(this.children[index]);
                this.children.splice(index, 1);
            }
            index = this._mouseGrabObjects.indexOf(ctl);
            if (index > -1) {
                this._mouseGrabObjects.splice(index, 1);
            }
        }
        this.requestRender();
        this._adsorb.update();
        return result;
    }

    public clear() {
        this.releaseGrabObjects();
        this.connector = null;
        this.selected = null;
        this.cursor.update(null);
        this._adsorb.clear();
        this._adsorb.enabled = false;
        while (this.children.length > 0) {
            var control = this.children.shift();
            control.remove();
        }
        this._adsorb.enabled = true;
        this._maxSerialNumber = 0;
    }


    public toPolygon(): number[][][] {
        var result: number[][][] = [];
        for (var control of this._children) {
            if (control instanceof PolygonControl) {
                result.push(control.toPolygon());
            }
        }
        return result;
    }


    public serialize(): GroupWalls {
        var area: GroupWalls = {
            anchors: [],
            walls: []
        };
        for (var control of this._children) {
            if (control instanceof PolygonControl) {
                area.walls.push(control.serialize());
            } else if (control instanceof AnchorControl) {
                if (control.polygons.length > 0) {
                    area.anchors.push(control.serialize());
                }
            }
        }
        return area;
    }


    public from(area: GroupWalls) {
        this.clear();
        var map: { [key: string]: AnchorControl } = {};
        var objects: Control[] = [];
        for (let anchor of area.anchors) {
            map[anchor.id] = this.createAnchor(anchor.id, anchor.x, anchor.y);
            objects.push(map[anchor.id]);
        }
        for (let wall of area.walls) {
            var from = map[wall.anchors[0]];
            var to = map[wall.anchors[1]];
            if (from && to) {
                var segment = this.createPolygon(wall.id, from, to, wall.thick);
                if (segment) {
                    segment.height = wall.height;
                    objects.push(segment);
                }
            }
        }
        for (let key in map) {
            map[key].update();
        }
        this.add.apply(this, objects);
        map = {};
    }


    public get isDisposed(): boolean {
        return this._isdisposed;
    }

    public get zoom(): number {
        return this._zoom;
    }
    public get res(): number {
        return this._res;
    }

    public get bounds(): Bounds {
        return this._bounds;
    }

    public get renderer(): Renderer {
        return this._renderer;
    }

    public get width(): number {
        return this._width;
    }

    public get height(): number {
        return this._height;
    }

    public get center(): Vector2 {
        return this._center;
    }

    public get viewControl(): ViewController {
        return this._viewControl;
    }

    public get onRender(): signals.Signal {
        return this._onRender;
    }

    public get cursor(): Cursor {
        return this._cursor;
    }


    public get onCursorChange(): signals.Signal {
        return this._onCursor;
    }



    public get onZoom(): signals.Signal {
        return this._onZoom;
    }



    public get container(): HTMLDivElement {
        return this._div;
    }

}