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
import { AreaWalls } from "../src/core/WallElement";

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

        // 
        designer.onZoom.add(e => {
            var scale = document.getElementById("scale") as HTMLDivElement;
            scale.innerText = e + '%';
        }, this);

        var btnBuild = document.getElementById("btnBuild") as HTMLCanvasElement;
        if (btnBuild) {
            btnBuild.onclick = () => {
                var output = document.getElementById("output") as HTMLTextAreaElement;
                output.value = JSON.stringify(designer.serialize());
            }
        }

        var btnParse = document.getElementById("btnParse") as HTMLCanvasElement;
        if (btnParse) {
            btnParse.onclick = () => {
                var output = document.getElementById("output") as HTMLTextAreaElement;
                var arrays = JSON.parse(output.value) as AreaWalls;
                console.time('Parse');
                // console.profile('Parse')
                designer.from(arrays);
                // console.profileEnd('Parse');
                console.timeEnd('Parse');
            }
        }



        var btnClean = document.getElementById("btnClean") as HTMLCanvasElement;
        if (btnClean) {
            btnClean.onclick = () => {
                designer.clear();
            }
        }

        var btnGoCenter = document.getElementById("btnGoCenter") as HTMLCanvasElement;
        if (btnGoCenter) {
            btnGoCenter.onclick = () => {
                designer.viewControl.onmove.dispatch(100, new Vector2(), true);
            }
        }

        var btnRandom = document.getElementById("btnRandom") as HTMLCanvasElement;
        if (btnRandom) {
            btnRandom.onclick = () => {
                var anthors: AnchorControl[] = [];
                var segments: PolygonControl[] = [];
                var objects: Control[] = [];
                for (let anchor of designer.children) {
                    if (anchor instanceof AnchorControl) {
                        anthors.push(anchor);
                    }
                }
                for (var i = 0; i <= 20; i++) {
                    var anchor = designer.createAnchor(null, Math.random() * 2000 - 1000, Math.random() * 2000 - 1000);
                    anthors.push(anchor);
                    objects.push(anchor);
                }
                for (var i = 0; i < 20; i++) {
                    while (segments[i] == null) {
                        var f = Math.round(Math.random() * (anthors.length - 1));
                        var t = Math.round(Math.random() * (anthors.length - 1));
                        segments[i] = designer.createPolygon(null, anthors[f], anthors[t]);
                    }
                    objects.push(segments[i]);
                }


                for (let object of anthors) {
                    if (object instanceof AnchorControl) {
                        if (object.polygons.length == 0) {
                            var index = objects.indexOf(object);
                            if (index > -1) {
                                objects.splice(index, 1);
                            }
                        }
                    }
                }

                for (let object of anthors) {
                    if (object instanceof AnchorControl) {
                        object.update();
                    }
                }

                designer.add.apply(designer, objects);

            }
        }








    }
}


new Examples().main();