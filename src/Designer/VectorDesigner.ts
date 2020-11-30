import * as signals from "signals";
import { Vector2 } from "../core/Vector2";
import { Bounds } from "./common/Bounds";
import { Renderer } from "./Renderer";
import { Size } from "./common/Size";
import { ViewController } from "./ViewController";
import { Control } from "./Views/Control";
import { ToolBar } from "./Menus/ToolBar";
import { AnchorControl } from './Views/AnchorControl';
import { PolygonControl } from './Views/PolygonControl';


export class VectorDesigner {

    private _viewControl: ViewController;
    private _div: HTMLDivElement;
    private _bounds: Bounds;
    private _renderer: Renderer;
    private _zoom: number;
    private _center: Vector2;
    private _res: number;
    private _runState: boolean;
    private _onRender: signals.Signal;
    public _width: number;
    public _height: number;
    public _children: Control[];
    private _toolbar: ToolBar;
    private _selected: Control;

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
            if (this._selected != null) {
                //
                var pt = this.convertPoint(this._selected.getCenter());
                this.toolbar.setPosition(pt);
                this.toolbar.visible = true;
                this._selected.selectedUpdate(true);
            }
        }
    }

    public add(...ctls: Control[]) {
        for (let ctl of ctls) {
            if (ctl instanceof AnchorControl) {
                this.children.push(ctl);
            } else if (ctl instanceof PolygonControl) {
                this.children.unshift(ctl);
            }
        }
    }
    public remove(...ctls: Control[]) {
        for (let ctl of ctls) {
            var index = this.children.indexOf(ctl);
            if (index > -1) {
                this.children.splice(index, 1);
            }
        }
    }



    public constructor(div: HTMLDivElement) {
        this._div = div;
        this._zoom = 100;
        this._children = [];
        this._onRender = new signals.Signal;
        this._renderer = new Renderer();
        this._viewControl = new ViewController(this);
        this._runState = false;
        this._renderer.apply(div);
        this.resize();
        this._viewControl.onmove.add(this.moveTo, this);
        this._toolbar = new ToolBar(this);
        this._div.appendChild(this._toolbar.dom);
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
    }

    public async run() {
        this._runState = true;
        await this.graphicRender();
    }


    private async graphicRender() {
        if (!this._runState || this.isDisposed) return;
        this.renderer.clear();
        var pt = this.convertPoint(new Vector2(-5, -5));


        for (var control of this._children) {
            control.render();
        }



        this.renderer.strokeColor = '#00FF00'
        this.renderer.line(0, this.viewControl.position.y, this.width, this.viewControl.position.y, 1);
        this.renderer.line(this.viewControl.position.x, 0, this.viewControl.position.x, this.height);
        this.onRender.dispatch();
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



    public convertPoints(points: Vector2[]): Vector2[] {
        var result = [];
        for (let point of points) {
            result.push(this.convertPoint(point));
        }
        return result;
    }




    public get isDisposed(): boolean {
        return false;
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


    public get container(): HTMLDivElement {
        return this._div;
    }

}