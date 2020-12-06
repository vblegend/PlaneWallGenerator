
import { Vector2, IVector2 } from '../../Core/Vector2';
import { Control, ControlDragEvent } from './Control';
import { VectorDesigner } from '../VectorDesigner';
import { Anchor } from '../../Core/Anchor';
import { RenderType } from '../Renderer';
import { WallControl } from './WallControl';
import * as signals from 'signals';
import { AnchorPoint } from '../../Core/Common';


export class HoleControl extends Control {
    public width: number;
    public thickness: number;
    public angle: number;
    public distance: number;
    private _installed: boolean;
    private _parent: WallControl;
    private _points: Vector2[];
    private _pressedOffset: Vector2;


    public get installed(): boolean {
        return this._installed;
    }

    public get parent(): WallControl {
        return this._parent;
    }


    public constructor(designer: VectorDesigner, x?: number, y?: number) {
        super(designer);
        this.dragDelayTime = 50;
        this.thickness = 10;
        this.width = 30;
        this.angle = 0;
        this.position.set(x, y);
        this.fillColor = '#b5e61d';
        this.strokeColor = '#FFFFFF';
        this.distance = 0;
        this._points = [new Vector2(), new Vector2(), new Vector2(), new Vector2()];
        this.update();
    }
    protected onClick() {
        this.designer.selected = this;
    }


    protected onBeginDrag(e: ControlDragEvent) {
        this.designer.grabObjects([this]);
        this.designer.cursor.update(this.position);
        this._pressedOffset = e.viewPos.sub(this.position);
        this.designer.requestRender();
    }


    protected onDraging(e: ControlDragEvent) {
        const hitObject = this.designer.viewControl.hitObject;
        let viewPos: Vector2;// 
        let result: Vector2;
        // 如果鼠标在墙上  吸附到墙壁上
        if (hitObject instanceof WallControl) {
            result = viewPos = hitObject.getSubPoint(e.position);
            // 坐标 holes
            this.position.copy(viewPos);
            // 与第一个锚点的距离
            const dis = this.position.distanceTo(hitObject.anchors[0].position);
            this.distance = dis / hitObject.distance;
            // 角度
            this.angle = hitObject.angle;
            // 厚度
            this.thickness = hitObject.thickness
            // 宽度
            // this.width
        }
        else {
            viewPos = e.viewPos.sub(this._pressedOffset).round(4);
            result = null;
            this.angle = 0;
            this.thickness = 10;
        }
        this.update();
        this.position.copy(viewPos);
        this.designer.cursor.update(this.position, result);
        this.designer.requestRender();
    }




    protected onEndDrag(e: ControlDragEvent) {
        var hitObject = this.designer.viewControl.hitObject;
        if (hitObject != this) {

            if (hitObject instanceof WallControl) {
                this.remove();
                this.designer.cursor.update(null);
                this.designer.discardGrabObjects();
                hitObject.addHole(this);
                return;
            }
            else {
                this.remove();
                this.designer.add(this);
            }

        }
        this.designer.cursor.update(null);
        this.designer.releaseGrabObjects();
        this.designer.updateElementPoints();
        this.designer.requestRender();
    }



    public render() {
        this.designer.renderer.opacity = this.opacity;
        this.designer.renderer.fillColor = this.isHover && !this.isSelected ? this.hoverColor : this.fillColor;
        this.designer.renderer.strokeColor = this.strokeColor;

        const size = new Vector2(this.width / 2, this.thickness / 2);
        const left = this.position.sub(size);
        const pt = this.designer.convertPoint(left);
        const center = this.designer.convertPoint(this.position);

        this.designer.renderer.translateRotate(center.x, center.y, this.angle);
        this.designer.renderer.rectangle(pt.x, pt.y, this.width / this.designer.res, this.thickness / this.designer.res, RenderType.ALL /* / this.designer.res */);
        this.designer.renderer.translateRotate(center.x, center.y, -this.angle);

        for (let point of this._points) {
            const pt = this.designer.convertPoint(point);
            this.designer.renderer.circle(pt.x, pt.y, 1 / this.designer.res, RenderType.ALL);
        }



    }




    public update() {
        if (this._parent && !this.isDraging) {
            this.angle = this._parent.angle;
            this.thickness = this._parent.thickness;
            const offsetDistance = this._parent.distance * this.distance;
            const pos = this._parent.anchors[0].position.moveTo(this._parent.anchors[1].position, offsetDistance);
            this.position.copy(pos);
        }
        // 计算 门对象的矩形区域，用于鼠标检测
        const l1 = new Vector2(this.position.x - this.width / 2, this.position.y - this.thickness / 2);
        const l2 = new Vector2(this.position.x - this.width / 2, this.position.y + this.thickness / 2);
        const r1 = new Vector2(this.position.x + this.width / 2, this.position.y - this.thickness / 2);
        const r2 = new Vector2(this.position.x + this.width / 2, this.position.y + this.thickness / 2);
        this._points[0].copy(l1.around(this.position, this.angle));
        this._points[1].copy(r1.around(this.position, this.angle));
        this._points[2].copy(r2.around(this.position, this.angle));
        this._points[3].copy(l2.around(this.position, this.angle));
    }

    public install(parent: WallControl) {
        this._parent = parent;
        this._installed = true;
    }

    public unInstall() {
        this._parent = null;
        this._installed = false;
    }

    public remove() {
        if (this._parent) {
            this._parent.removeHole(this);
        }
    }

    public selectedUpdate(value: boolean) {
        super.selectedUpdate(value);
        this.fillColor = value ? '#0078d7' : '#b5e61d';
    }

    public hit(point: Vector2): boolean {
        return point.inPolygon(this._points);
    }

    public serialize(): AnchorPoint {
        return {
            id: this.id,
            x: this.position.x,
            y: this.position.y
        };
    }

}