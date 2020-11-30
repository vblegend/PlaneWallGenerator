
import { Vector2 } from '../../core/Vector2';
import { Control } from './Control';
import { VectorDesigner } from '../VectorDesigner';
import { Anchor } from '../../core/Anchor';
import { RenderType } from '../Renderer';
import { basename } from 'path';
import { PolygonControl } from './PolygonControl';
import * as signals from 'signals';


export class AnchorControl extends Control {

    public position: Vector2;
    private _anchor: Anchor;
    private _onupdate: signals.Signal;
    private _polygons: PolygonControl[];

    public get onUpdate(): signals.Signal {
        return this._onupdate;
    }



    public constructor(designer: VectorDesigner, x?: number, y?: number) {
        super(designer);
        this._onupdate = new signals.Signal();
        this._polygons = [];
        this.position = new Vector2(x | 0, y | 0);
        this._anchor = new Anchor(this.id, this.position.x, this.position.y);
        this.fillColor = '#b5e61d';
        this.strokeColor = '#FFFFFF';
    }



    public addPolygon(p: PolygonControl) {
        this._polygons.push(p);
    }



    public setPosition(v: Vector2) {
        this.position = v.clone();
        this._anchor.setPosition(v);


    }


    public dispose() {
        if (this.designer != null) {
            this.designer.remove(this);
            //删除锚点时 删除锚点相连线段
            while (this._polygons.length) {
                var polygon = this._polygons.shift();
                this.designer.remove(polygon);
                polygon.dispose();
            }
            //销毁锚点
            this._anchor.dispose();
            this._onupdate.removeAll();
            super.dispose();
        }

    }

    public update() {
        this._anchor.build();
        this.onUpdate.dispatch();
    }

    protected onClick() {
        this.designer.selected = this;
    }

    public getCenter(): Vector2 {
        return this.position;
    }

    public selectedUpdate(value: boolean) {
        super.selectedUpdate(value);
        this.fillColor = value ? '#0078d7' : '#b5e61d';
    }


    public hit(point: Vector2): boolean {
        return point.inCircle(this.position, 10 * this.designer.res);
    }

    public render() {
        this.designer.renderer.opacity = this.opacity;
        this.designer.renderer.fillColor = this.isHover && !this.isSelected ? this.hoverColor : this.fillColor;
        this.designer.renderer.strokeColor = this.strokeColor;
        var pt = this.designer.convertPoint(this.position);
        this.designer.renderer.circle(pt.x, pt.y, 5, RenderType.ALL /* / this.designer.res */);
    }

    public get left(): number {
        return this.position.x;
    }

    public get top(): number {
        return this.position.y;
    }

    public get anchor(): Anchor {
        return this._anchor;
    }
}