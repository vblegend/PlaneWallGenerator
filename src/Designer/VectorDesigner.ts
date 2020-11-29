import * as signals from "signals";
import { Vector2 } from "../core/Vector2";
import { Bounds } from "./common/Bounds";
import { EventCallBack, Events } from "./common/Events";
import { Renderer } from "./common/Renderer";
import { Size } from "./common/Size";
import { ViewController } from "./common/ViewController";


export class VectorDesigner {

    private _viewControl: ViewController;
    private _div: HTMLDivElement;
    private _bounds: Bounds;
    private _renderer: Renderer;
    private _zoom: number;
    private _center: Vector2;
    private _res: number;

    private _runState: boolean;

    public _width: number;
    public _height: number;



    public constructor(div: HTMLDivElement) {
        this._div = div;
        this._zoom = 100;
        this._renderer = new Renderer();
        this._viewControl = new ViewController(this);
        this._runState = false;
        this._renderer.apply(div);
        this.resize();
        this._viewControl.onmove.add(this.moveTo, this);
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


        var pt = this.getLocalXY(new Vector2(-5, -5));
        this.renderer.context.fillStyle = '#ff0000';
        this.renderer.context.fillRect(pt.x, pt.y, 10 / this.res, 10 / this.res);

        this.renderer.context.strokeStyle = '#00FF00'
        this.renderer.line(0, this.viewControl.position.y, this.width, this.viewControl.position.y, 1);
        this.renderer.line(this.viewControl.position.x, 0, this.viewControl.position.x, this.height);





        this.dispatchEvent(Events.RENDER);
        if (!this.isDisposed && this._runState) {
            //继续下一帧
            requestAnimationFrame(this.graphicRender.bind(this));
        }
    }



    /**
     * 获得一个点在屏幕实际显示的位置。
     * @param point 
     */
    getLocalXY(point: Vector2) {
        var resolution = this.res;
        var extent = this.bounds;
        var x = (point.x / resolution + (-extent.left / resolution));
        var y = (point.y / resolution + (-extent.top / resolution));
        return new Vector2(x, y);
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



    /**
     * 添加对事件的监听
     * @param event 监听的事件
     * @param callback 回调方法  回调参数查看AppLicationEvents注释
     * @param thisContext this上下文 留空为默认
     */
    public addEventListener(event: Events, callback: EventCallBack, thisContext: any = null) {
        // this.checkDispose();
        if (callback == null) throw "property Callback is not allowed to be empty";
        var hub = this.eventListeners[event];
        if (hub == null) {
            hub = new signals.Signal();
            this.eventListeners[event] = hub;
        }
        hub.add(callback, thisContext);
    }

    /**
     * 移除对事件的监听
     * @param event 监听的事件
     * @param callback 回调
     */
    public removeEventListener(event: Events, callback: EventCallBack) {
        // if (this._isdisposed) {
        //     return;
        // }
        if (callback == null) throw "property Callback is not allowed to be empty";
        var hub = this.eventListeners[event];
        if (hub != null) {
            hub.remove(callback);
        }
        if (hub.length == 0) {
            delete this.eventListeners[event];
        }
    }

    /**
     * 发起一个应用程序事件
     * @param event 事件类型 
     * @param args 事件参数
     */
    public dispatchEvent(event: Events, ...value: any[]) {
        // if (this._isdisposed) {
        //     return;
        // }
        var hub = this.eventListeners[event];
        if (hub != null) {
            hub.dispatch.apply(null, value);
        }
    }

    /**
     * 订阅消息的对象
     */
    private eventListeners: { [event: number]: signals.Signal } = {};
}