import { Adorner } from "../src/core/Adorner";
import { Segment } from "../src/core/Segment";
import { HorizontalRuler } from "../src/Designer/plugins/HorizontalRuler";
import { VerticalRuler } from "../src/Designer/plugins/VerticalRuler";
import { VectorDesigner } from "../src/Designer/VectorDesigner";

/**
 * this is example
 */
export class Examples {
    /**
     * main function
     */
    public async main() {
        var div = <HTMLDivElement>document.getElementById("example");
        var designer = new VectorDesigner(div);

        var hrulercanvas = document.getElementById("HorizontalRulerCanvas") as HTMLCanvasElement;

        var vrulercanvas = document.getElementById("VerticalRulerCanvas") as HTMLCanvasElement;

        var hRuler = new HorizontalRuler(designer, hrulercanvas);
        var vRuler = new VerticalRuler(designer, vrulercanvas);


        designer.run();

    }

}


new Examples().main();