
import { Vector2 } from '../../core/Vector2';
import { Control } from './Control';
import { VectorDesigner } from '../VectorDesigner';
import { Segment } from '../../core/Segment';
import { Anchor } from '../../core/Anchor';
import { AnchorControl } from './AnchorControl';
import { RenderType } from '../Renderer';
import { Bounds } from '../common/Bounds';


export class PolygonControl extends Control {
    private _segment: Segment;
    private _hTime: number;
    private _points: Vector2[];
    private _bounds: Bounds;
    private _anchors: AnchorControl[];
    private _moveing: boolean;


    public constructor(designer: VectorDesigner, anchor1: AnchorControl, anchor2: AnchorControl, thickness: number) {
        super(designer);
        this._anchors = [anchor1, anchor2];
        this._points = [];
        this._bounds = new Bounds(0, 0, 0, 0);
        this._segment = new Segment(anchor1.anchor, anchor2.anchor, thickness);
        this.strokeColor = '#FFFFFF';
        this.fillColor = '#888888';
        this._anchors[0].onUpdate.add(this.update, this);
        this._anchors[1].onUpdate.add(this.update, this);
        this._anchors[0].addPolygon(this, this._anchors[1]);
        this._anchors[1].addPolygon(this, this._anchors[0]);
    }



    public get thickness(): number {
        return this._segment.thickness;
    }

    public set thickness(value: number) {
        this._segment.thickness = value;
    }

    public updateThickness(thickness: number) {
        this.thickness = thickness;
        for (let anchor of this._anchors) {
            anchor.update();
        }
        this.update();
    }


    public get id(): number {
        return this._segment.id;
    }
    public set id(value: number) {
        this._segment.id = value;
    }


    public remove(removeanchor: boolean = true) {
        super.remove();
        this._segment.dispose();
        this._anchors[0].onUpdate.remove(this.update, this);
        this._anchors[1].onUpdate.remove(this.update, this);
        this._anchors[0].removePolygon(this, this._anchors[1]);
        this._anchors[1].removePolygon(this, this._anchors[0]);
        while (this._anchors.length > 0 && removeanchor) {
            let anchorControl = this._anchors.shift();
            if (anchorControl.anchor.targets.length === 0) {
                anchorControl.remove();
            }
            else {
                anchorControl.update();
            }
        }
    }



    public getSubPoint(canvasPoint: Vector2) {
        var mousePosition = this.designer.mapPoint(canvasPoint);
        return Vector2.getProjectivePoint(this.anchors[0].position, this.anchors[1].position, mousePosition);
    }


    public split(point: Vector2): AnchorControl {
        var polygons: PolygonControl[] = [];
        var anchors: AnchorControl[] = [];
        var anchor1 = this.anchors[0];
        var anchor2 = this.anchors[1];
        var mousePosition = this.designer.mapPoint(point);
        var target = Vector2.getProjectivePoint(anchor1.position, anchor2.position, mousePosition);
        var targetAnchor = this.designer.createAnchor(target.x, target.y);
        anchors.push(targetAnchor);
        for (let anchor of this.anchors) {
            var segment = this.designer.createPolygon(anchor, targetAnchor,this.thickness);
            if (segment != null) polygons.push(segment);
            anchors.push(anchor);
        }
        for (let anchor of anchors) {
            anchor.update();
        }
        targetAnchor.update();
        // update segments
        for (let f of polygons) {
            f.update();
            this.designer.add(f);
        }
        this.remove();
        this.designer.add(targetAnchor);
        return targetAnchor;
    }




    protected onMouseEnter() {
        super.onMouseEnter();
        if (this.isSelected) {

        }
    }

    protected onMouseLeave() {
        super.onMouseLeave();
    }


    protected onMouseDown(button: number, pos: Vector2) {
        super.onMouseDown(button, pos);
        if (button === 0) {
            this._hTime = window.setTimeout(() => {
                this._hTime = null;
                if (this.designer.viewControl.hitObject == this) {
                    this.designer.renderer.canvas.style.cursor = 'move';
                    this._moveing = true;
                    this.beginDrag(this.position);
                }
            }, 200);
        }
    }

    protected onMouseMove(button: number, pos: Vector2) {
        super.onMouseMove(button, pos);
        if (this._moveing) {
            this.draging(pos);
        }
    }

    protected onMouseUp(button: number, pos: Vector2) {
        super.onMouseUp(button, pos);
        if (this._hTime) {
            window.clearTimeout(this._hTime);
            this._hTime = null;
        }
        if (this._moveing) {
            this._moveing = false;
            this.designer.renderer.canvas.style.cursor = 'default';
            this.EndDrag(this.position);
        }
    }




    private _anchorPositions: Vector2[];

    private beginDrag(canvasPosition: Vector2) {
        var viewPos = this.designer.mapPoint(canvasPosition);
        this._anchorPositions = [viewPos.sub(this.anchors[0].position), viewPos.sub(this.anchors[1].position)];
    }

    private draging(canvasPosition: Vector2) {
        console.log('draging');
        var viewPos = this.designer.mapPoint(canvasPosition);

        // var pos1 = viewPos.sub(this._anchorPositions[0]);
        // var pos2 = viewPos.sub(this._anchorPositions[1]);

        // var result1 = this.designer.adsorb.adsorption(pos1);
        // var result2 = this.designer.adsorb.adsorption(pos2);

        // var minx = Math.min(result1.x ? result1.x : pos1.x, result2.x ? result2.x : pos2.x);
        // var miny = Math.min(result1.y ? result1.y : pos1.y, result2.y ? result2.y : pos2.y);






        this.anchors[0].setPosition(viewPos.sub(this._anchorPositions[0]));
        this.anchors[1].setPosition(viewPos.sub(this._anchorPositions[1]));
        this.anchors[0].updateNearby();
        this.anchors[1].updateNearby();
        this.designer.requestRender();
    }

    private EndDrag(canvasPosition: Vector2) {
        console.log('EndDrag');
    }









    public update() {
        if (this._segment != null) {
            this._points = [];
            this._bounds = new Bounds(0, 0, 0, 0);
            for (let point of this._segment.points) {
                const v = new Vector2().fromArray(point);
                this._points.push(v);
                this._bounds.extendFromPoint(v);
            }
        }
    }

    public hit(point: Vector2): boolean {
        return point.inPolygon(this._points);
    }


    public selectedUpdate(value: boolean) {
        super.selectedUpdate(value);
        this.fillColor = value ? '#0078d7' : '#888888';
    }

    protected onClick() {
        this.designer.selected = this;
    }

    public getCenter(): Vector2 {
        return this._bounds.getCenter();
    }

    public render() {
        this.designer.renderer.opacity = this.opacity;
        this.designer.renderer.fillColor = this.isHover && !this.isSelected ? this.hoverColor : this.fillColor;
        this.designer.renderer.strokeColor = this.strokeColor;
        this.designer.renderer.polygon(this.designer.convertPoints(this._points), true, RenderType.ALL);
    }

    public get anchors(): AnchorControl[] {
        return this._anchors;
    }


    public toArray(): number[][] {
        return this._segment.points;
    }

    public get points(): Vector2[] {
        return this._points;
    }


    public toString(): string {
        return `id=${this.id}`;
    }




}