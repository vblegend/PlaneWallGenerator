
import { Vector2, IVector2 } from '../../Core/Vector2';
import { Control, ControlDragEvent } from './Control';
import { VectorDesigner } from '../VectorDesigner';
import { Anchor } from '../../Core/Anchor';
import { RenderType } from '../Renderer';
import { WallControl } from './WallControl';
import * as signals from 'signals';
import { ElementAnchor, ElementHole } from '../../Core/Common';
import { Hole } from '../../Core/Hole';


export class HoleControl extends Control {
    public angle: number;
    private _parent: WallControl;
    private _points: Vector2[];
    private _pressedOffset: Vector2;
    public _hole: Hole;


    public get id(): number {
        return this._hole.id;
    }
    public set id(value: number) {
        this._hole.id = value;
    }

    public get location(): number {
        return this._hole.location;
    }
    public set location(value: number) {
        this._hole.location = value;
    }

    public get width(): number {
        return this._hole.width;
    }
    public set width(value: number) {
        this._hole.width = value;
    }

    public get height(): number {
        return this._hole.height;
    }
    public set height(value: number) {
        this._hole.height = value;
    }

    public get ground(): number {
        return this._hole.ground;
    }
    public set ground(value: number) {
        this._hole.ground = value;
    }

    public get thickness(): number {
        return this._hole.thickness;
    }
    public set thickness(value: number) {
        this._hole.thickness = value;
    }


    public constructor(designer: VectorDesigner, x?: number, y?: number) {
        super(designer);
        this._hole = new Hole();
        this.dragDelayTime = 50;
        this.thickness = 10;
        this.width = 110;
        this.angle = 0;
        this.ground = 0;
        this.height = 100;
        this.position.set(x, y);
        this.fillColor = '#b5e61d';
        this.strokeColor = '#FFFFFF';
        this.location = 0;
        this._points = [new Vector2(), new Vector2(), new Vector2(), new Vector2()];

        this.update();
    }

    public get installed(): boolean {
        return this._parent != null;
    }

    public get parent(): WallControl {
        return this._parent;
    }

    public get hole(): Hole {
        return this._hole;
    }

    protected onClick() {
        this.designer.selected = this;
    }


    protected onBeginDrag(e: ControlDragEvent) {
        this.designer.clearEvents();
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
            // 与第一个锚点的距离
            const dis = viewPos.distanceTo(hitObject.anchors[0].position);
            this.location = dis / hitObject.distance;
            //洞宽的一半占墙长度的百分比
            var wd = this.width / 2 / hitObject.distance;

            if (this.location - wd < 0) {
                this.location = wd;
                viewPos = hitObject.anchors[0].position.moveTo(hitObject.anchors[1].position, this.location * hitObject.distance);
            }
            if (this.location + wd > 1) {
                this.location = 1 - wd;
                viewPos = hitObject.anchors[0].position.moveTo(hitObject.anchors[1].position, this.location * hitObject.distance);
            }
            // 坐标 holes
            this.position.copy(viewPos);
            // 角度
            this.angle = hitObject.angle;
            // 厚度
            this.thickness = hitObject.thickness
            // 宽度
            // this.width
        }
        else {
            viewPos = e.viewPos.sub(this._pressedOffset).round(4);
            result = Vector2.null;
            this.angle = 0;
            this.thickness = 10;
        }
        this.position.copy(viewPos);
        this.designer.cursor.update(this.position, result);
        this.update();
        this.designer.requestRender();
    }




    protected onEndDrag(e: ControlDragEvent) {
        var hitObject = this.designer.viewControl.hitObject;
        if (hitObject != this) {

            if (this._parent) {
                let parent = this._parent;
                this.remove();
                this.designer.updateEvents(parent);
            }
            if (hitObject instanceof WallControl) {
                this.designer.cursor.update(null);
                this.designer.discardGrabObjects();
                hitObject.addHole(this);
                this.update();
                this.designer.updateEvents(hitObject);
                this.designer.dispatchEvents();
                return;
            }
            else {
                this.designer.add(this);
            }
        }
        this.update();
        this.designer.cursor.update(null);
        this.designer.releaseGrabObjects();
        this.designer.updateElementPoints();
        this.designer.requestRender();
        this.designer.dispatchEvents();
    }



    public render() {
        this.designer.renderer.opacity = this.opacity;
        this.designer.renderer.fillColor = this.isHover && !this.isSelected ? this.hoverColor : this.fillColor;
        this.designer.renderer.strokeColor = this.strokeColor;

        const size = new Vector2(this.width / 2, this.thickness / 2);
        const left = this.position.sub(size);
        const pt = this.designer.convertPoint(left);
        const center = this.designer.convertPoint(this.position);

        this.designer.renderer.rotate(center.x, center.y, this.angle,()=>{
            this.designer.renderer.rectangle(pt.x, pt.y, this.width / this.designer.res, this.thickness / this.designer.res, RenderType.ALL /* / this.designer.res */);
        });

        for (let point of this._points) {
            const pt = this.designer.convertPoint(point);
            this.designer.renderer.circle(pt.x, pt.y, 1 / this.designer.res, RenderType.ALL);
        }
    }

    public update() {
        this._hole.update();
        if (this.installed && !this.isDraging) {
            this.angle = this._parent.angle;
            this.thickness = this._parent.thickness;
            const offsetDistance = this._parent.distance * this.location;
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
    }

    public unInstall() {
        this._parent = null;
    }

    public remove() {
        if (this._parent) {
            this._parent.removeHole(this);
        }
        else{
            this.designer.remove(this);
        }
    }

    public selectedUpdate(value: boolean) {
        super.selectedUpdate(value);
        this.fillColor = value ? '#0078d7' : '#b5e61d';
    }

    public hit(point: Vector2): boolean {
        return point.inPolygon(this._points);
    }

    public serialize(): ElementHole {
        return {
            id: this.id,
            location: this.location,
            //  angle: this.parent.angle,
            width: this.width,
            ground: this.ground,
            height: this.height
        };
    }

}