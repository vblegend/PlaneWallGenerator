
import { Vector2, IVector2 } from '../../Core/Vector2';
import { Control, ControlDragEvent } from './Control';
import { VectorDesigner } from '../VectorDesigner';
import { Anchor } from '../../Core/Anchor';
import { RenderType } from '../Renderer';
import { PolygonControl } from './PolygonControl';
import * as signals from 'signals';
import { AnchorPoint } from '../../Core/WallElement';


export class DoorControl extends Control {
    private _anchor: Anchor;
    private _onupdate: signals.Signal;
    private _polygons: PolygonControl[];

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
        this.dragDelayTime = 50;
        this.position.set(x, y);
        this._anchor = new Anchor(0, this.position.x, this.position.y);
        this.fillColor = '#b5e61d';
        this.strokeColor = '#FFFFFF';
    }



    protected onBeginDrag(e: ControlDragEvent) {
        this.designer.grabObjects([this]);
        this.designer.updateElementPoints();
        this.designer.cursor.update(this.position);
    }


    protected onDraging(e: ControlDragEvent) {
        var viewPos = e.viewPos.sub(e.offset);
        var result: IVector2;
        var hitObject = this.designer.viewControl.hitObject;
        // 如果鼠标在墙上  吸附到墙壁上
        if (hitObject != this && hitObject instanceof PolygonControl) {
            result = viewPos = hitObject.getSubPoint(e.position);
        }
        this.designer.cursor.update(this.position,result);
        this.designer.requestRender();
    }

    protected onEndDrag(e: ControlDragEvent) {
        this.designer.cursor.update(null);
        this.designer.releaseGrabObjects();
        this.designer.updateElementPoints();
    }

















    public remove() {
        super.remove();
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

    public serialize(): AnchorPoint {
        return {
            id: this.id,
            x: this.position.x,
            y: this.position.y
        };
    }

}