
import { IVector2, Vector2 } from '../../Core/Vector2';
import { Control, ControlDragEvent } from './Control';
import { VectorDesigner } from '../VectorDesigner';
import { Wall } from '../../Core/Wall';
import { Anchor } from '../../Core/Anchor';
import { AnchorControl } from './AnchorControl';
import { RenderType, HorizontalAlign, VerticalAlign } from '../Renderer';
import { Bounds } from '../Common/Bounds';
import { CylinderPolygon as CylinderPolygon, ElementClinder as ElementCylinder, HolePolygon, WallPolygon, ElementWall } from '../../Core/Common';
import { HoleControl } from './HoleControl';
import { MathHelper } from '../../Core/MathHelper';
import { Cylinder } from '../../Core/Cylinder';



export class CylinderControl extends Control {
    private _clinder: Cylinder;
    private _resizeing: boolean;
    private _cursorPosition: Vector2;

    public constructor(designer: VectorDesigner, id: number, x: number, y: number, radius: number, height: number) {
        super(designer);
        this.dragDelayTime = 50;
        this._clinder = new Cylinder(id, x, y, radius, height);
        this.strokeColor = '#FFFFFF';
        this.fillColor = '#888888';

    }

    public get position(): Vector2 {
        return this._clinder.position;
    }
    public set position(value: Vector2) {
        this._clinder.position = value;
    }

    public get radius(): number {
        return this._clinder.radius;
    }
    public set radius(value: number) {
        this._clinder.radius = value;
    }

    public get height(): number {
        return this._clinder.height;
    }
    public set height(value: number) {
        this._clinder.height = value;
    }

    public get id(): number {
        return this._clinder.id;
    }
    public set id(value: number) {
        this._clinder.id = value;
    }



    protected onMouseMove(button: number, canvasPos: Vector2) {
        super.onMouseMove(button, canvasPos);
        const viewpos = this.designer.mapPoint(canvasPos);
        const length = viewpos.distanceTo(this.position);
        if (!this.isDraging) {
            if (length > this.radius * 0.9) {
                if (!this._resizeing) {
                    this.designer.canvas.style.cursor = "none";
                    this._resizeing = true;
                    this._cursorPosition = canvasPos.clone();
                }
            }
            else {
                if (this._resizeing) {
                    this._resizeing = false;
                    this.designer.canvas.style.cursor = "default";
                    this.designer.requestRender();
                }
            }
        }
        if (this._resizeing) {
            this._cursorPosition = canvasPos.clone();
            this.designer.requestRender();
        }

    }
    protected onMouseLeave() {
        super.onMouseLeave();
        if (!this.isDraging && this._resizeing) {
            this.designer.canvas.style.cursor = "default";
            this._resizeing = false;
        }

    }


    protected onBeginDrag(e: ControlDragEvent) {
        this.designer.clearEvents();
        this.designer.grabObjects([this]);
        this.designer.updateElementPoints();
        this.designer.cursor.update(this.position);
        this.designer.requestRender();
    }

    protected onDraging(e: ControlDragEvent) {
        var viewPos = e.viewPos.sub(e.offset).round(4);
        var result: IVector2;
        if (this._resizeing) {
            viewPos = e.viewPos.round(4);
            this.radius = viewPos.distanceTo(this.position);
            this.update();
        } else {
            viewPos = e.viewPos.sub(e.offset).round(4);
            result = this.designer.adsorb.adsorption(viewPos);
            this.position.copy(viewPos);
            this.designer.cursor.update(this.position, result);
        }
        this.designer.requestRender();
    }


    protected onEndDrag(e: ControlDragEvent) {
        if (!this._resizeing) {
            var viewPos = e.viewPos.sub(e.offset).round(4);
            this.designer.adsorb.adsorption(viewPos);
            this.position.copy(viewPos);
        }
        this.designer.cursor.update(null);
        this.designer.renderer.canvas.style.cursor = 'default';
        this.designer.releaseGrabObjects();
        this.designer.updateElementPoints();
        this.designer.dispatchEvents();
    }


    public update() {
        this.designer.updateEvents(this);
        this.designer.requestRender();
    }

    public hit(point: Vector2): boolean {
        return point.inCircle(this.position, this.radius);
    }


    public selectedUpdate(value: boolean) {
        super.selectedUpdate(value);
        this.fillColor = value ? '#0078d7' : '#888888';
    }

    protected onClick() {
        this.designer.selected = this;
    }

    public render() {
        let radius = this.radius / this.designer.res;
        this.designer.renderer.opacity = this.opacity;
        this.designer.renderer.fillColor = this.isHover && !this.isSelected ? this.hoverColor : this.fillColor;
        this.designer.renderer.strokeColor = this.strokeColor;
        const pos = this.designer.convertPoint(this.position);
        this.designer.renderer.circle(pos.x, pos.y, radius, RenderType.ALL);
        // if (radius > 10) {
        //     var pt = this.designer.convertPoint(this.position);
        //     this.designer.renderer.circle(pt.x, pt.y, 5, RenderType.ALL /* / this.designer.res */);
        // }

        if (this.isHover || this.isSelected || this.designer.viewControl.alt) {
            this.designer.renderer.fillColor = this.isSelected ? '#FFFFFF' : '#ABABAB';
            this.designer.renderer.fontSize = this.radius / 2 / this.designer.res;
            this.designer.renderer.fillText((this.radius * 2 / 100).toFixed(2) + '米', pos.x, pos.y, null, HorizontalAlign.CENTER, VerticalAlign.CENTER);
        }

        if (this._resizeing) {
            this.designer.renderer.fillColor = '#111111';
            const pos = this.designer.convertPoint(this.position);
            const angle = pos.angle(this._cursorPosition);
            let leftArrow = [new Vector2(this._cursorPosition.x - 10, this._cursorPosition.y), new Vector2(this._cursorPosition.x - 3, this._cursorPosition.y - 5), new Vector2(this._cursorPosition.x - 3, this._cursorPosition.y + 5)]
            let rightArrow = [new Vector2(this._cursorPosition.x + 10, this._cursorPosition.y), new Vector2(this._cursorPosition.x + 3, this._cursorPosition.y + 5), new Vector2(this._cursorPosition.x + 3, this._cursorPosition.y - 5)]
            this.designer.renderer.rotate(this._cursorPosition.x, this._cursorPosition.y, angle, () => {
                this.designer.renderer.polygon(leftArrow, true, RenderType.ALL);
                this.designer.renderer.polygon(rightArrow, true, RenderType.ALL);
            });
        }

    }



    public onLoad() {
        super.onLoad();
        this.designer.updateEvents(this);
    }

    public onUnLoad() {
        super.onUnLoad();
        this.designer.updateEvents(this);
    }


    public toPolygon(relocation?: boolean): CylinderPolygon {
        var config = new CylinderPolygon();
        config.id = this.id;
        config.h = this.height;
        config.p = this.position.toArray();
        config.r = this.loaded ? this.radius : 0;
        return config;
    }

    public serialize(): ElementCylinder {
        let clinder: ElementCylinder = {
            id: this._clinder.id,
            p: this.position.toArray(),
            r: this.radius,
            h: this.height
        };
        return clinder;
    }


}