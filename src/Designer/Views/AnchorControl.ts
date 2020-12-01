
import { Vector2 } from '../../core/Vector2';
import { Control } from './Control';
import { VectorDesigner } from '../VectorDesigner';
import { Anchor } from '../../core/Anchor';
import { RenderType } from '../Renderer';
import { PolygonControl } from './PolygonControl';
import * as signals from 'signals';
import { Segment } from '../../core/Segment';


export class AnchorControl extends Control {

    public position: Vector2;
    private _anchor: Anchor;
    private _onupdate: signals.Signal;
    private _polygons: PolygonControl[];

    private _linked: AnchorControl[];


    public get onUpdate(): signals.Signal {
        return this._onupdate;
    }

    public get id(): number {
        return this._anchor.id;
    }
    public set id(value: number) {
        this._anchor.id = value;
    }

    public constructor(designer: VectorDesigner, x?: number, y?: number) {
        super(designer);
        this._onupdate = new signals.Signal();
        this._polygons = [];
        this._linked = [];
        this.position = new Vector2(x | 0, y | 0);
        this._anchor = new Anchor(0, this.position.x, this.position.y);
        this.fillColor = '#b5e61d';
        this.strokeColor = '#FFFFFF';
    }



    private pressedPosition: Vector2;

    protected onMouseDown(button: number, position: Vector2) {
        var projectPosition = this.designer.mapPoint(position);
        if (this.isSelected) {
            if (button === 0) {
                this.pressedPosition = projectPosition;
                this.designer.virtualCursor = this;
            }
        }
    }
    protected onMouseMove(button: number, position: Vector2) {
        var projectPosition = this.designer.mapPoint(position);
        if (this.pressedPosition) {
            var pos = projectPosition.sub(this.pressedPosition);
            this.pressedPosition = projectPosition;
            this.setPosition(pos.add(this.position));
            this.updateNearby();
        }
    }


    protected onMouseUp(button: number, pos: Vector2) {
        this.pressedPosition = null;
        this.designer.virtualCursor = null;
        if (this.designer.viewControl.hoverObject != this) {
            if (this.designer.viewControl.hoverObject instanceof PolygonControl) {
                // split
                var targetAnchor = this.designer.viewControl.hoverObject.split(this.designer.viewControl.position);
                // merage
                this.merageTo(targetAnchor);
            } else if (this.designer.viewControl.hoverObject instanceof AnchorControl) {
                // merage
                this.merageTo(this.designer.viewControl.hoverObject);
            }
        }
    }


    merageTo(ANCHOR: AnchorControl): boolean {
        //不支持合并到自己的另一端
        if (this.anchor.targets.indexOf(ANCHOR.anchor) > -1) return false;
        var polygons: PolygonControl[] = [];
        // look look 与自己相连的锚点
        for (let anchor of this._linked) {
            var poly = this.designer.createPolygon(anchor, ANCHOR);
            if (poly != null) {
                polygons.push(poly);
            }
        }
        //remove self
        this.remove();
        // update anchor
        ANCHOR.update();
        // update segments
        for (let f of polygons) {
            f.update();
            this.designer.add(f);
        }
        this.designer.selected = ANCHOR;
        return true;
    }







    private updateNearby() {
        for (let target of this._polygons) {
            for (let v of target.anchors) {
                if (v !== this) {
                    v.update();
                }
            }
        }
        this.update();
    }

    public addPolygon(p: PolygonControl, a: AnchorControl) {
        this._polygons.push(p);
        this._linked.push(a);
    }

    public removePolygon(p: PolygonControl, a: AnchorControl) {
        var index = this._polygons.indexOf(p);
        if (index > -1) this._polygons.splice(index, 1);
        index = this._linked.indexOf(a);
        if (index > -1) this._linked.splice(index, 1);
    }

    public get polygons(): PolygonControl[] {
        return this._polygons;
    }




    public setPosition(v: Vector2) {
        this.position = v.clone();
        this._anchor.setPosition(v);
    }

    public remove() {
        super.remove();
        this._linked = [];
        while (this._polygons.length) {
            var polygon = this._polygons.shift();
            polygon.remove();
        }
        this._anchor.remove();
        this._onupdate.removeAll();
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
    public get points(): Vector2[] {
        return [this.position];
    }
}