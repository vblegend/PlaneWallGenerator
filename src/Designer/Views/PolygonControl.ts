
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
    public thickness: number;
    private points: Vector2[];
    private _bounds: Bounds;
    private _anchors: AnchorControl[];



    public constructor(designer: VectorDesigner, anchor1: AnchorControl, anchor2: AnchorControl) {
        super(designer);
        this._anchors = [anchor1, anchor2];
        this.thickness = 10;
        this.points = [];
        this._bounds = new Bounds(0, 0, 0, 0);
        this._segment = new Segment(anchor1.anchor, anchor2.anchor, this.thickness);
        this.update();
        this.strokeColor = '#FFFFFF';
        this.fillColor = '#888888';
        this._anchors[0].onUpdate.add(this.update, this);
        this._anchors[1].onUpdate.add(this.update, this);
        this._anchors[0].addPolygon(this);
        this._anchors[1].addPolygon(this);
    }

    public dispose() {
        if (this.designer != null) {
            this.designer.remove(this);
            this._segment.dispose();
            while (this._anchors.length > 0) {
                let anchorControl = this._anchors.shift();
                anchorControl.onUpdate.remove(this.update, this);
                if (anchorControl.anchor.targets.length == 0) {
                    this.designer.remove(anchorControl);
                    anchorControl.dispose();
                }
                else {
                    anchorControl.update();
                }
            }
            super.dispose();
        }

    }

    public update() {
        if (this._segment != null) {
            this.points = [];
            this._bounds = new Bounds(0, 0, 0, 0);
            for (let point of this._segment.points) {
                const v = new Vector2().fromArray(point);
                this.points.push(v);
                this._bounds.extendFromPoint(v);
            }
        }
    }

    public hit(point: Vector2): boolean {
        return point.inPolygon(this.points);
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
        this.designer.renderer.polygon(this.designer.convertPoints(this.points), true, RenderType.ALL);
    }

    public get anchors(): AnchorControl[] {
        return this._anchors;
    }


    public toArray(): number[][] {
        return this._segment.points;
    }


}