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
        var segments: { [key: string]: PolygonControl } = {};




        for (var i = 0; i <= 100; i++) {
            anthors[i] = designer.createAnchor(Math.random() * 2000 - 1000, Math.random() * 2000 - 1000);
            anthors[i].id = i;
        }

        for (var i = 0; i < 100; i++) {
            while (segments[i] == null) {
                var f = Math.round(Math.random() * 100);
                var t = Math.round(Math.random() * 100);              
                segments[i] = designer.createPolygon(anthors[f], anthors[t]);
            }
            segments[i].id = i;
        }

        for (let key in anthors) {
            anthors[key].update();
            designer.add(anthors[key]);
        }


        for (let key in segments) {
            segments[key].update();
            designer.add(segments[key]);
        }

        // 
        designer.onZoom.add(e => {

            var scale = document.getElementById("scale") as HTMLDivElement;
            scale.innerText = e + '%';

        }, this);
        var btnBuild = document.getElementById("btnBuild") as HTMLCanvasElement;
        if (btnBuild) {
            btnBuild.onclick = () => {
                var result = designer.toArrray();
                var output = document.getElementById("output") as HTMLTextAreaElement;
                var outputText = 'var arrays = \r\n[\r\n';
                for (let data of result) {
                    outputText += '    ';
                    outputText += JSON.stringify(data);
                    outputText += ',\r\n';
                }
                output.value = outputText + ']\r\n';
            }
        }
    }
}


new Examples().main();