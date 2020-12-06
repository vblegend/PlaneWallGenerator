
import { Vector2 } from '../../Core/Vector2';
import { Control, ControlDragEvent } from './Control';
import { VectorDesigner } from '../VectorDesigner';
import { Segment } from '../../Core/Segment';
import { Anchor } from '../../Core/Anchor';
import { AnchorControl } from './AnchorControl';
import { RenderType, HorizontalAlign, VerticalAlign } from '../Renderer';
import { Bounds } from '../Common/Bounds';
import { WallSegment } from '../../Core/Common';
import { HoleControl } from './HoleControl';
import { MathHelper } from '../../Core/MathHelper';



export class WallControl extends Control {
    private _segment: Segment;
    private _points: Vector2[];
    private _bounds: Bounds;
    private _anchors: AnchorControl[];
    private _anchorPositions: Vector2[];
    public height: number;
    private _holes: HoleControl[];
    private _angle: number;
    private _distance: number;


    public constructor(designer: VectorDesigner, id: number, anchor1: AnchorControl, anchor2: AnchorControl, thickness: number) {
        super(designer);
        this._anchors = [anchor1, anchor2];
        this._points = [];
        this._holes = [];
        this._angle = 0;

        this.dragDelayTime = 200;
        this._bounds = new Bounds(0, 0, 0, 0);
        this._segment = new Segment(id, anchor1.anchor, anchor2.anchor, thickness);
        this._distance = anchor1.position.distanceTo(anchor2.position);
        this.strokeColor = '#FFFFFF';
        this.fillColor = '#888888';
        this._anchors[0].onUpdate.add(this.update, this);
        this._anchors[1].onUpdate.add(this.update, this);
        this._anchors[0].addWall(this, this._anchors[1]);
        this._anchors[1].addWall(this, this._anchors[0]);
    }


    public addHole(hole: HoleControl) {
        if (this._holes.indexOf(hole) == -1) {
            hole.install(this);
            this._holes.push(hole);
            this.children.push(hole);
        }
    }
    public removeHole(hole: HoleControl) {
        let index = this._holes.indexOf(hole);
        if (index > -1) {
            this._holes[index].unInstall();
            this._holes.splice(index, 1);
        }
        index = this.children.indexOf(hole);
        if (index > -1) {
            this.children.splice(index, 1);
        }


    }



    public get distance(): number {
        return this._distance;
    }

    public get angle(): number {
        return this._angle;
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
        this._anchors[0].removeWall(this, this._anchors[1]);
        this._anchors[1].removeWall(this, this._anchors[0]);
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
        return MathHelper.getProjectivePoint(this.anchors[0].position, this.anchors[1].position, mousePosition);
    }


    public split(point: Vector2): AnchorControl {
        var walls: WallControl[] = [];
        var anchors: AnchorControl[] = [];
        var anchor1 = this.anchors[0];
        var anchor2 = this.anchors[1];
        var mousePosition = this.designer.mapPoint(point);
        var target = MathHelper.getProjectivePoint(anchor1.position, anchor2.position, mousePosition);
        var targetAnchor = this.designer.createAnchor(null, target.x, target.y);
        anchors.push(targetAnchor);
        for (let anchor of this.anchors) {
            var segment = this.designer.createPolygon(null, anchor, targetAnchor, this.thickness);
            if (segment != null) walls.push(segment);
            anchors.push(anchor);
        }
        for (let anchor of anchors) {
            anchor.update();
        }
        targetAnchor.update();
        // update segments
        for (let f of walls) {
            f.update();
            this.designer.add(f);
        }
        this.remove();
        this.designer.add(targetAnchor);
        return targetAnchor;
    }


    protected onBeginDrag(e: ControlDragEvent) {
        this.designer.renderer.canvas.style.cursor = 'move';
        this._anchorPositions = [e.viewPos.sub(this.anchors[0].position), e.viewPos.sub(this.anchors[1].position)];
    }



    protected onDraging(e: ControlDragEvent) {
        // var pos1 = viewPos.sub(this._anchorPositions[0]);
        // var pos2 = viewPos.sub(this._anchorPositions[1]);
        // var result1 = this.designer.adsorb.adsorption(pos1);
        // var result2 = this.designer.adsorb.adsorption(pos2);
        // var minx = Math.min(result1.x ? result1.x : pos1.x, result2.x ? result2.x : pos2.x);
        // var miny = Math.min(result1.y ? result1.y : pos1.y, result2.y ? result2.y : pos2.y);


        this.anchors[0].setPosition(e.viewPos.sub(this._anchorPositions[0]).round(4));
        this.anchors[1].setPosition(e.viewPos.sub(this._anchorPositions[1]).round(4));
        this.anchors[0].updateNearby();
        this.anchors[1].updateNearby();
        this.designer.requestRender();
    }


    protected onEndDrag(e: ControlDragEvent) {
        this.designer.renderer.canvas.style.cursor = 'default';
    }


    public update() {
        if (this._segment != null && this._segment.pointsUpdated) {
            this._points = [];
            this._bounds = new Bounds(0, 0, 0, 0);
            var points = this._segment.points;
            this._distance = this.anchors[0].position.distanceTo(this.anchors[1].position);
            this._angle = this.anchors[0].position.angle(this.anchors[1].position);
            for (let point of points) {
                const v = new Vector2().fromArray(point);
                this._points.push(v);
                this._bounds.extendFromPoint(v);
            }
            for (let hole of this._holes) {
                hole.update();
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

    public render() {
        this.designer.renderer.opacity = this.opacity;
        this.designer.renderer.fillColor = this.isHover && !this.isSelected ? this.hoverColor : this.fillColor;
        this.designer.renderer.strokeColor = this.strokeColor;
        this.designer.renderer.polygon(this.designer.convertPoints(this._points), true, RenderType.ALL);

        if (this.isHover || this.isSelected || this.anchors.indexOf(this.designer.selected as any) > -1 || this.designer.viewControl.alt) {
            //取 最长边的距离 而不是取锚点的距离
            let d1 = this._points[2].distanceTo(this._points[3]);
            let d2 = this._points[0].distanceTo(this._points[5]);
            var distance = Math.max(d1, d2).toFixed(2) + 'mm';
            let pointa = this.anchors[0].position;
            let pointb = this.anchors[1].position;
            if (pointa.x < pointb.x) {
                let m = pointa;
                pointa = pointb;
                pointb = m;
            }
            this.designer.renderer.fontSize = 10 / this.designer.res;
            let pos = this.designer.convertPoint(pointa.center(pointb));
            let angle = pointa.angle(pointb);
            this.designer.renderer.fillColor = this.isSelected ? '#FFFFFF' : '#ABABAB';
            this.designer.renderer.translateRotate(pos.x, pos.y, angle);
            this.designer.renderer.fillText(distance, pos.x, pos.y, null, HorizontalAlign.CENTER, VerticalAlign.CENTER);
            this.designer.renderer.translateRotate(pos.x, pos.y, -angle);
        }

        for (let hole of this._holes) {
            hole.render();
        }



    }

    public get anchors(): AnchorControl[] {
        return this._anchors;
    }


    public toPolygon(): number[][] {
        return this._segment.points;
    }

    public serialize(): WallSegment {
        return {
            id: this.id,
            anchors: [this.anchors[0].id, this.anchors[1].id],
            thick: this.thickness,
            height: this.height,
        };
    }


}