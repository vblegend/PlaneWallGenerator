import { IVector2, Vector2 } from '../../Core/Vector2';
import { VectorDesigner } from '../VectorDesigner';
import { AnchorControl } from '../Views/AnchorControl';
import { WallControl } from '../Views/WallControl';
import { Control } from '../Views/Control';



export class Connector {
    designer: VectorDesigner;
    origin: AnchorControl;
    newAnchor: AnchorControl;
    newSegment: WallControl;

    public constructor(designer: VectorDesigner, origin: AnchorControl) {
        this.designer = designer;
        this.origin = origin;
        const v = this.designer.mapPoint(this.designer.viewControl.position);
        this.newAnchor = this.designer.createAnchor(null, v.x, v.y, true);
        const values = origin.walls.map((e) => e.thickness);
        values.push(this.designer.defaultthickness);
        const thickness = Math.max.apply(this, values);


        this.newSegment = this.designer.createPolygon(null, origin, this.newAnchor, thickness);
        this.designer.cursor.update(v);
        this.update(this.designer.viewControl.position);
    }



    public update(canvasPoint?: Vector2, control?: Control) {
        let position: Vector2;
        let result: IVector2;
        if (control instanceof WallControl) {
            position = control.getSubPoint(canvasPoint).round(4);
            result = new Vector2(1, 1);
        }
        else if (canvasPoint != null) {
            position = this.designer.mapPoint(canvasPoint).round(4);
            result = this.designer.adsorb.adsorption(position);
        }
        if (position) {
            this.newAnchor.setPosition(position);
            this.designer.cursor.update(position, result);
        }
        this.newAnchor.update();
        this.origin.update();
        this.designer.requestRender();
        this.designer.onRender.dispatch();
    }








    public commit(hover: Control, position: Vector2): boolean {
        const point = this.newAnchor.position;
        let anchor = this.designer._children.find((e) => e instanceof AnchorControl && e.anchor.x === point.x && e.anchor.y === point.y) as AnchorControl;
        if (this.origin === anchor || this.designer.connector.origin === hover) {
            return false;
        }
        if (hover instanceof AnchorControl) {
            anchor = hover;
        }
        const thickness = this.newSegment.thickness;
        const height = this.newSegment.height;
        if (hover instanceof WallControl) {
            this.newSegment.remove(false);
            this.newAnchor.remove();
            // split
            this.newAnchor = hover.split(this.designer.viewControl.position);
            // merage
            this.newSegment = this.designer.createPolygon(null, this.origin, this.newAnchor, thickness);
            this.newSegment.height = height;
            this.newAnchor.update();
            this.origin.update();
        } else if (anchor != null) {
            /* connect to old anchor , remove new anchor and  segment */
            this.newSegment.remove(false);
            this.newAnchor.remove();
            this.newAnchor = anchor;
            /* use old anchor create new anchor */
            this.newSegment = this.designer.createPolygon(null, this.origin, this.newAnchor, thickness);
            this.newSegment.height = height;
            this.update(position);
        }
        /* add objects to designer */
        this.designer.add(this.newAnchor, this.newSegment);
        this.designer.selected = this.newAnchor;
        this.designer.dispatchEvents();
        return true;
    }

    public render() {
        if (this.newSegment != null) {
            this.newSegment.render();
        }
        if (this.newAnchor != null) {
            this.newAnchor.render();
        }
    }


    public cancel() {
        this.newSegment.remove(false);
        this.newAnchor.remove();
        this.newSegment = null;
        this.newAnchor = null;
        this.origin.update();
        this.designer.clearEvents();
    }


}