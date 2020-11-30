import { Vector2 } from "../../core/Vector2";
import { VectorDesigner } from "../VectorDesigner";
import { AnchorControl } from "./AnchorControl";
import { PolygonControl } from "./PolygonControl";



export class Connector {
    designer: VectorDesigner;

    origin: AnchorControl;

    newAnchor: AnchorControl;

    newSegment: PolygonControl;

    public constructor(designer: VectorDesigner, origin: AnchorControl) {
        this.designer = designer;
        this.origin = origin;
        this.newAnchor = new AnchorControl(this.designer, -50, 18);
        this.newSegment = new PolygonControl(this.designer, origin, this.newAnchor);
        this.update();
        this.designer.add(this.newAnchor, this.newSegment);
    }



    public update(v?: Vector2) {
        if (v != null) {
            this.newAnchor.setPosition(v);
        }
        this.newAnchor.update();
        this.origin.update();
    }


    public commit() {
        this.designer.selected = this.newAnchor;
    }

    public cancel() {
        this.newSegment.dispose();
        this.newAnchor.dispose();
        this.origin.update();
    }


}