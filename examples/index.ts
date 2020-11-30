import { Anchor } from "../src/core/Anchor";
import { Segment } from "../src/core/Segment";
import { HorizontalRuler } from "../src/Designer/plugins/HorizontalRuler";
import { VerticalRuler } from "../src/Designer/plugins/VerticalRuler";
import { VectorDesigner } from "../src/Designer/VectorDesigner";
import { Vector2 } from '../src/core/Vector2';
import { AnchorControl } from "../src/Designer/Views/AnchorControl";
import { PolygonControl } from "../src/Designer/Views/PolygonControl";
import { FORMERR } from "dns";

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

        var anthors: { [key: string]: AnchorControl } = {};
        anthors[0] = new AnchorControl(designer, -20, -10);
        anthors[1] = new AnchorControl(designer, 0, 0);
        anthors[2] = new AnchorControl(designer, 0, 20);
        anthors[3] = new AnchorControl(designer, 20, 20);
        //  anthors[4] = new AnchorControl(designer, 50, -18);


        var segments: { [key: string]: PolygonControl } = {};

        segments[0] = new PolygonControl(designer, anthors[0], anthors[1]);
        segments[1] = new PolygonControl(designer, anthors[2], anthors[1]);
        segments[2] = new PolygonControl(designer, anthors[1], anthors[3]);
        // segments[3] = new PolygonControl(designer, anthors[1], anthors[4]);


        for (let key in anthors) {
            anthors[key].update();
            designer.add(anthors[key]);
        }


        for (let key in segments) {
            segments[key].update();
            designer.add(segments[key]);
        }

        // 
        designer.onZoom.add(e=>{

            var scale = document.getElementById("scale") as HTMLDivElement;
            scale.innerText = e + '%';

        },this);


        var btnBuild = document.getElementById("btnBuild") as HTMLCanvasElement;
        if (btnBuild) {
            btnBuild.onclick = () => {
                var result = designer.toArrray();
                var output = document.getElementById("output") as HTMLTextAreaElement;
                var outputText = '';
                for (let data of result) {
                    outputText += JSON.stringify(data);
                    outputText += '\r\n';
                }
                output.textContent = outputText;
            }
        }



    }

}


new Examples().main();