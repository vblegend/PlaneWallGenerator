import * as signals from "signals";
import { Vector2 } from "../Core/Vector2";
import { Bounds } from "./Common/Bounds";
import { Renderer } from "./Renderer";
import { Size } from "./Common/Size";
import { ViewController } from "./ViewController";
import { Control } from "./Views/Control";
import { ToolBar } from "./Menus/ToolBar";
import { AnchorControl } from './Views/AnchorControl';
import { WallControl } from './Views/WallControl';
import { Connector } from "./Common/Connector";
import { AdsorbService } from "./Common/AdsorbService";
import { GroupWalls, WallSegment, WallPolygon } from '../Core/Common';
import { ImageControl } from "./Views/ImageControl";
import { Cursor } from "./Views/Cursor";
import { HoleControl } from "./Views/HoleControl";
import { ToolBox } from "./Menus/ToolBox";
import { DragService } from "./Plugins/DragService";


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
    private _onMoved: signals.Signal;
    private _onRender: signals.Signal;
    private _onZoom: signals.Signal;
    private _onCursor: signals.Signal;
    private _onWallChange: signals.Signal;

    private _cursor: Cursor;

    public _width: number;
    public _height: number;
    public _children: Control[];
    private _toolbar: ToolBar;
    private _toolbox: ToolBox;
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
                pt = this.convertPoint(this._selected.position).add(new Vector2(20, 10));
            } else if (this._selected instanceof WallControl) {
                pt = this._selected.getSubPoint(this.viewControl.position);
                pt = this.convertPoint(pt).add(new Vector2(20, 10));
            } else if (this._selected instanceof HoleControl) {
                pt = this.convertPoint(this._selected.position).add(new Vector2(20, 10));
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
        this._events = {};
        this._children = [];
        this._mouseGrabObjects = [];
        this._cursor = new Cursor(this);
        this._adsorb = new AdsorbService(this);
        this._onMoved = new signals.Signal();
        this._onRender = new signals.Signal();
        this._onZoom = new signals.Signal();
        this._onCursor = new signals.Signal();
        this._onWallChange = new signals.Signal();
        this._renderer = new Renderer();
        this._viewControl = new ViewController(this);
        this._runState = false;
        this._renderer.apply(div);
        this.resize();
        this._background = new ImageControl(this);
        this._toolbar = new ToolBar(this);
        this._div.appendChild(this._toolbar.dom);
        this._toolbox = new ToolBox(this);
        this._div.appendChild(this._toolbox.dom);
        this._requestRender = true;
        this.defaultHeight = 250;
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
        this.requestRender();
    }

    /**
     * 移动图的某个位置到设计区中心
     * @param zoom  缩放倍数  100 为 100%
     * @param center 设计区的中心
     */
    public moveTo(zoom?: number, center?: Vector2) {
        if (zoom != null) {
            if (zoom <= 0) {
                return;
            }
            if (this._zoom != zoom) {
                this._zoom = zoom;
                this.onZoom.dispatch(zoom);
            }
        }
        if (center != null) {
            if (this._center != center) {
                this._center = center;
            }
            this._res = 1 / (this._zoom / 100);
            var width = this.width * this._res;
            var height = this.height * this._res;
            //获取新的视图范围。
            this._bounds = new Bounds(center.x - width / 2, center.y - height / 2, center.x + width / 2, center.y + height / 2);
        }
        //
        this.onMoved.dispatch();
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
        if (this._toolbox) {
            this._toolbox.dispose();
            this._toolbox = null;
        }

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
    public createAnchor(id: number, x: number, y: number, Forced?: boolean): AnchorControl {
        x = Math.floor(x * 10000) / 10000;
        y = Math.floor(y * 10000) / 10000;
        if (id == null) {
            if (!Forced) {
                for (let anchor of this.children) {
                    if (anchor instanceof AnchorControl) {
                        if (anchor.anchor.x === x && anchor.anchor.y === y) {
                            return anchor;
                        }
                    }
                }
            }
            id = ++this._maxSerialNumber;
        }
        const anchor = new AnchorControl(this, x, y);
        anchor.id = id;
        if (id >= this._maxSerialNumber) {
            this._maxSerialNumber = id + 1;
        }
        return anchor;
    }

    public createPolygon(id: number, anchor1: AnchorControl, anchor2: AnchorControl, thickness?: number): WallControl {
        if (anchor1 == anchor2) return null;
        if (anchor1.anchor.targets.indexOf(anchor2.anchor) > -1) {
            for (let wall of anchor1.walls) {
                if (wall.anchors.indexOf(anchor1) > -1 && wall.anchors.indexOf(anchor2) > -1) {
                    return wall;
                }
            }
            return null;
        }
        if (id) {
            if (id >= this._maxSerialNumber) {
                this._maxSerialNumber = id + 1;
            }
        } else {
            id = ++this._maxSerialNumber;
        }
        if (thickness == null) thickness = this.defaultthickness;
        const wall = new WallControl(this, id, anchor1, anchor2, thickness);
        wall.height = this.defaultHeight;
        return wall;
    }





    public createHole(id: number, x: number, y: number): HoleControl {
        x = Math.floor(x * 10000) / 10000;
        y = Math.floor(y * 10000) / 10000;
        if (id == null) {
            id = ++this._maxSerialNumber;
        }
        const hole = new HoleControl(this, x, y);
        hole.height = this.defaultHeight;
        hole.id = id;
        if (id >= this._maxSerialNumber) {
            this._maxSerialNumber = id + 1;
        }
        return hole;
    }



    public add(...ctls: Control[]) {
        for (let ctl of ctls) {
            if (ctl != null) {
                const index = this.children.indexOf(ctl);
                if (ctl.id && ctl.id >= this._maxSerialNumber) {
                    this._maxSerialNumber = ctl.id + 1;
                }
                if (index == -1) {
                    ctl.onLoad();
                    if (ctl instanceof AnchorControl) {
                        this.children.push(ctl);
                    } else if (ctl instanceof WallControl) {
                        this.children.unshift(ctl);
                    } else if (ctl instanceof HoleControl) {
                        this.children.unshift(ctl);
                    }

                }
            }
        }
        this.requestRender();
        this._adsorb.update();
    }


    private _events: { [id: string]: WallPolygon }

    public updateEvents(wall: WallControl) {
        this._events[wall.id] = wall.toPolygon();
    }

    public clearEvents() {
        this._events = {};
    }


    public dispatchEvents() {
        for (let key in this._events) {
            let value = this._events[key];
            this._onWallChange.dispatch(value);
        }
        this._events = {};
    }




    public remove(...ctls: Control[]): Control[] {
        const result = [];
        for (let ctl of ctls) {
            let index = this.children.indexOf(ctl);
            if (index > -1) {
                ctl.onUnLoad();
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
            const control = this.children.shift();
            control.remove();
        }
        this._adsorb.enabled = true;
        this._maxSerialNumber = 0;
    }


    public toPolygon(relocation?: boolean): WallPolygon[] {
        const result: WallPolygon[] = [];
        for (var control of this._children) {
            if (control instanceof WallControl) {
                result.push(control.toPolygon(relocation));
            }
        }
        return result;
    }


    public serialize(): GroupWalls {
        const area: GroupWalls = {
            anchors: [],
            walls: []
        };
        for (var control of this._children) {
            if (control instanceof WallControl) {
                area.walls.unshift(control.serialize());
            } else if (control instanceof AnchorControl) {
                if (control.walls.length > 0) {
                    area.anchors.push(control.serialize());
                }
            }
        }
        return area;
    }


    public from(area: GroupWalls) {
        this.clear();
        let map: { [key: string]: AnchorControl } = {};
        const objects: Control[] = [];
        for (let anchor of area.anchors) {
            map[anchor.id] = this.createAnchor(anchor.id, anchor.x, anchor.y);
            objects.push(map[anchor.id]);
        }
        for (let wallConfig of area.walls) {
            const from = map[wallConfig.anchors[0]];
            const to = map[wallConfig.anchors[1]];
            if (from && to) {
                const wall = this.createPolygon(wallConfig.id, from, to, wallConfig.thick);
                if (wall) {
                    wall.height = wallConfig.height;
                    objects.push(wall);
                    if (wallConfig.holes && wallConfig.holes.length > 0) {
                        for (let holeConfig of wallConfig.holes) {
                            let hole = this.createHole(holeConfig.id, 0, 0);
                            hole.width = holeConfig.width;
                            hole.height = holeConfig.height;
                            hole.ground = holeConfig.ground;
                            hole.location = holeConfig.location;
                            wall.addHole(hole);
                        }
                    }
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

    public get onWallChange(): signals.Signal {
        return this._onWallChange;
    }

    public get onZoom(): signals.Signal {
        return this._onZoom;
    }


    public get onMoved(): signals.Signal {
        return this._onMoved;
    }

    public get container(): HTMLDivElement {
        return this._div;
    }

}