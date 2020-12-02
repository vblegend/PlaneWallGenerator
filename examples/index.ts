import { Anchor } from "../src/core/Anchor";
import { Segment } from "../src/core/Segment";
import { HorizontalRuler } from "../src/Designer/plugins/HorizontalRuler";
import { VerticalRuler } from "../src/Designer/plugins/VerticalRuler";
import { VectorDesigner } from "../src/Designer/VectorDesigner";
import { Vector2 } from '../src/core/Vector2';
import { AnchorControl } from "../src/Designer/Views/AnchorControl";
import { PolygonControl } from "../src/Designer/Views/PolygonControl";
import { FORMERR } from "dns";
import { stringify } from "querystring";
import { Control } from "../src/Designer/Views/Control";

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
        var objects: Control[] = [];
        for (var i = 0; i <= 11; i++) {
            anthors[i] = designer.createAnchor(Math.random() * 2000 - 1000, Math.random() * 2000 - 1000);
            anthors[i].id = i;
            objects.push(anthors[i]);
        }
        for (var i = 0; i < 5; i++) {
            while (segments[i] == null) {
                var f = Math.round(Math.random() * 10);
                var t = Math.round(Math.random() * 10);
                segments[i] = designer.createPolygon(anthors[f], anthors[t]);
            }
            objects.push(segments[i]);
        }

        for (let key in anthors) {
            anthors[key].update();
        }

        designer.add.apply(designer, objects);

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
                var block = [];
                for (let data of result) {
                    block.push(JSON.stringify(data));
                }
                var outputText = '[\r\n    ' + block.join(',\r\n    ') + '\r\n]\r\n';
                output.value = outputText;
            }
        }

        var btnParse = document.getElementById("btnParse") as HTMLCanvasElement;
        if (btnParse) {
            btnParse.onclick = () => {
                var output = document.getElementById("output") as HTMLTextAreaElement;
                var arrays = JSON.parse(output.value) as number[][][];
                console.time('Parse');
                // console.profile('Parse')
                designer.from(arrays);
                // console.profileEnd('Parse');
                console.timeEnd('Parse');
            }
        }
    }
}


new Examples().main();