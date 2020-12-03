
import { Vector2, IVector2 } from '../../Core/Vector2';
import { Control, ControlDragEvent } from './Control';
import { VectorDesigner } from '../VectorDesigner';
import { Anchor } from '../../Core/Anchor';
import { RenderType } from '../Renderer';
import { PolygonControl } from './PolygonControl';
import * as signals from 'signals';
import { Segment } from '../../Core/Segment';
import { AdsorbResult } from '../Common/AdsorbService';
import { AnchorPoint } from '../../Core/WallElement';


export class AnchorControl extends Control {
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
        this.dragDelayTime = 50;
        this.position.set(x, y);
        this._anchor = new Anchor(0, this.position.x, this.position.y);
        this.fillColor = '#b5e61d';
        this.strokeColor = '#FFFFFF';
    }



    protected onBeginDrag(e: ControlDragEvent) {
        this.designer.grabObjects([this]);
        this.designer.updateElementPoints();
        this.designer.virtualCursor = this;
    }


    protected onDraging(e: ControlDragEvent) {
        var viewPos = e.viewPos.sub(e.offset);
        var result: IVector2;
        var hitObject = this.designer.viewControl.hitObject;
        // 如果鼠标在墙上  吸附到墙壁上
        if (hitObject != this && hitObject instanceof PolygonControl) {
            result = viewPos = hitObject.getSubPoint(e.position);
        }
        else {
            // 寻找默认吸附点
            result = this.designer.adsorb.adsorption(viewPos);
        }
        this.designer.horizontalLineColor = result.y != null ? '#0000FF' : '#00FF00';
        this.designer.verticalLineColor = result.x != null ? '#0000FF' : '#00FF00';
        this.setPosition(viewPos);
        this.updateNearby();
        this.designer.requestRender();
    }

    protected onEndDrag(e: ControlDragEvent) {
        this.designer.virtualCursor = null;
        var anchor = this.designer._children.find(e => e instanceof AnchorControl && e.anchor.x === this.anchor.x && e.anchor.y === this.anchor.y) as AnchorControl;
        if (anchor != null && anchor != this) {
            this.merageTo(anchor);
            this.designer.discardGrabObjects();
            return;
        }

        if (this.designer.viewControl.hitObject != this) {
            if (this.designer.viewControl.hitObject instanceof PolygonControl) {
                // split
                var targetAnchor = this.designer.viewControl.hitObject.split(this.designer.viewControl.position);
                // merage
                this.merageTo(targetAnchor);
            } else if (this.designer.viewControl.hitObject instanceof AnchorControl) {
                // merage
                this.merageTo(this.designer.viewControl.hitObject);
            }
        }
        this.designer.releaseGrabObjects();
        this.designer.updateElementPoints();
    }




















    public merageTo(ANCHOR: AnchorControl): boolean {
        //不支持合并到自己的另一端
        if (this.anchor.targets.indexOf(ANCHOR.anchor) > -1) return false;
        // look look 与自己相连的锚点
        for (let polygon of this._polygons) {
            var poly = this.designer.createPolygon(null, polygon.anchors[0] == this ? polygon.anchors[1] : polygon.anchors[0], ANCHOR, polygon.thickness);
            if (poly != null) {
                this.designer.add(poly);
            }
        }
        //remove self
        this.remove();
        // update anchor
        ANCHOR.update();
        // update segments
        this.designer.selected = ANCHOR;
        return true;
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
        this.position.copy(v);
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

    /**
     * Updates surrounding anchor points
     * @param excluded Excluded anchor points
     */
    public updateNearby(excluded?: AnchorControl) {
        for (let anchor of this._linked) {
            if (anchor !== excluded) {
                anchor.update();
            }
        }
        this.update();
    }



    public update() {
        this._anchor.build();
        this.onUpdate.dispatch();
    }

    protected onClick() {
        this.designer.selected = this;
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

    public get point(): Vector2 {
        return this.position;
    }


    public serialize(): AnchorPoint {
        return {
            id: this.id,
            x: this.position.x,
            y: this.position.y
        };
    }

}