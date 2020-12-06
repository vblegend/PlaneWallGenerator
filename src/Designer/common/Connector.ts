import { IVector2, Vector2 } from "../../Core/Vector2";
import { VectorDesigner } from "../VectorDesigner";
import { AnchorControl } from "../Views/AnchorControl";
import { WallControl } from "../Views/WallControl";
import { Control } from '../Views/Control';



export class Connector {
    designer: VectorDesigner;
    origin: AnchorControl;
    newAnchor: AnchorControl;
    newSegment: WallControl;

    public constructor(designer: VectorDesigner, origin: AnchorControl) {
        this.designer = designer;
        this.origin = origin;
        var v = this.designer.mapPoint(this.designer.viewControl.position);
        this.newAnchor = this.designer.createAnchor(null, v.x, v.y);
        this.newSegment = this.designer.createPolygon(null, origin, this.newAnchor, 10);
        this.designer.cursor.update(v);
        this.update();
    }



    public update(canvasPoint?: Vector2, control?: Control) {
        let position: Vector2;
        var result: IVector2;
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
            this.designer.cursor.update(position,result);
        }
        this.newAnchor.update();
        this.origin.update();
        this.designer.requestRender();
        this.designer.onRender.dispatch();
    }








    public commit(hover: Control, position: Vector2) {
        var point = this.newAnchor.point;
        var anchor = this.designer._children.find(e => e instanceof AnchorControl && e.anchor.x === point.x && e.anchor.y === point.y) as AnchorControl;
        if (hover instanceof AnchorControl) {
            anchor = hover;
        }
        if (hover instanceof WallControl) {
            this.newSegment.remove(false);
            this.newAnchor.remove();
            // split
            this.newAnchor = hover.split(this.designer.viewControl.position);
            // merage
            this.newSegment = this.designer.createPolygon(null, this.origin, this.newAnchor, 10);
            this.newAnchor.update();
            this.origin.update();
        } else if (anchor != null) {
            /* connect to old anchor , remove new anchor and  segment */
            this.newSegment.remove(false);
            this.newAnchor.remove();
            this.newAnchor = anchor;
            /* use old anchor create new anchor */
            this.newSegment = this.designer.createPolygon(null, this.origin, this.newAnchor, 10);
            this.update();
            /* add objects to designer */
            this.designer.add(this.newAnchor, this.newSegment);
        }
        this.designer.add(this.newAnchor, this.newSegment);
        this.designer.selected = this.newAnchor;
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
    }


}