import { Vector2 } from "../../core/Vector2";
import { VectorDesigner } from "../VectorDesigner";
import { AnchorControl } from "../Views/AnchorControl";
import { PolygonControl } from "../Views/PolygonControl";
import { Control } from '../Views/Control';



export class Connector {
    designer: VectorDesigner;
    origin: AnchorControl;
    newAnchor: AnchorControl;
    newSegment: PolygonControl;

    public constructor(designer: VectorDesigner, origin: AnchorControl) {
        this.designer = designer;
        this.origin = origin;
        var v = this.designer.mapPoint(this.designer.viewControl.position);
        this.newAnchor = new AnchorControl(this.designer, v.x, v.y);
        this.newSegment = new PolygonControl(this.designer, origin, this.newAnchor, 10);
        this.designer.virtualCursor = this.newAnchor;
        this.update();
    }



    public update(viewpos?: Vector2) {
        if (viewpos != null) {
            let position = viewpos.clone();
            var result = this.designer.adsorb.adsorption(position, 50);
            this.newAnchor.setPosition(position);
            this.designer.horizontalLineColor = result.y ? '#0000FF' : '#00FF00';
            this.designer.verticalLineColor = result.x ? '#0000FF' : '#00FF00';
        }
        this.newAnchor.update();
        this.origin.update();
    }








    public commit(hover: Control, position: Vector2) {
        if (hover instanceof AnchorControl) {
            /* connect to old anchor , remove new anchor and  segment */
            this.newSegment.remove();
            this.newAnchor.remove();
            this.newAnchor = hover;
            /* use old anchor create new anchor */
            this.newSegment = new PolygonControl(this.designer, this.origin, this.newAnchor, 10);
            this.update();
            /* add objects to designer */
            this.designer.add(this.newAnchor, this.newSegment);
        } else if (hover instanceof PolygonControl) {
            // split
            var targetAnchor = hover.split(this.designer.viewControl.position);
            // merage
            this.newAnchor.merageTo(targetAnchor);
        } else {
            this.designer.add(this.newAnchor, this.newSegment);
        }
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
        this.newSegment.remove();
        this.newAnchor.remove();
        this.newSegment = null;
        this.newAnchor = null;
        this.origin.update();
    }


}