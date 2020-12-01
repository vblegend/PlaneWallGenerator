
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

    private _points: Vector2[];
    private _bounds: Bounds;
    private _anchors: AnchorControl[];

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


    public remove() {
        super.remove();
        this._segment.dispose();
        this._anchors[0].onUpdate.remove(this.update, this);
        this._anchors[1].onUpdate.remove(this.update, this);
        this._anchors[0].removePolygon(this, this._anchors[1]);
        this._anchors[1].removePolygon(this, this._anchors[0]);
        while (this._anchors.length > 0) {
            let anchorControl = this._anchors.shift();
            if (anchorControl.anchor.targets.length === 0) {
                anchorControl.remove();
            }
            else {
                anchorControl.update();
            }
        }
    }


    public split(point: Vector2): AnchorControl {
        var polygons: PolygonControl[] = [];
        var anchors: AnchorControl[] = [];
        var anchor1 = this.anchors[0];
        var anchor2 = this.anchors[1];
        var mousePosition = this.designer.mapPoint(point);
        var target = this.getProjectivePoint(anchor1.position, anchor2.position, mousePosition);
        var targetAnchor = this.designer.createAnchor(target.x, target.y);
        anchors.push(targetAnchor);
        for (let anchor of this.anchors) {
            var segment = this.designer.createPolygon(anchor, targetAnchor);
            if (segment != null) polygons.push(segment);
            anchors.push(anchor);
        }
        for (let anchor of anchors) {
            anchor.update();
        }
        // update segments
        for (let f of polygons) {
            f.update();
            this.designer.add(f);
        }
        this.remove();
        this.designer.add(targetAnchor);
        return targetAnchor;
    }


    /// <summary>
    /// 计算直线上距离某坐标最近的一个投影点
    /// </summary>
    /// <param name="P1">直线的坐标1</param>
    /// <param name="P2">直线的坐标2</param>
    /// <param name="pOut">直线外的坐标</param>
    /// <returns></returns>
    protected getProjectivePoint(P1: Vector2, P2: Vector2, pOut: Vector2): Vector2 {
        var pLine: Vector2 = P1;
        if (P1.x == P2.x && P1.y == P2.y) {
            return P1;
        }
        if (P1.x == P2.x) {
            return new Vector2(pLine.x, pOut.y);
        }
        else if (P1.y == P2.y) //垂线斜率不存在情况
        {
            return new Vector2(pOut.x, pLine.y);
        }
        //计算线的斜率
        var k = ((P1.y - P2.y)) / (P1.x - P2.x);
        var X = ((k * pLine.x + pOut.x / k + pOut.y - pLine.y) / (1 / k + k));
        var Y = (-1 / k * (X - pOut.x) + pOut.y);
        return new Vector2(X, Y);
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
            //this.designer.updateElementPoints();
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
        if (this._points.length === 0) {
            this._anchors[0].update();
            this._anchors[1].update();
            this.update();
        }


        return this._points;
    }


    public toString(): string {
        return `id=${this.id}`;
    }




}