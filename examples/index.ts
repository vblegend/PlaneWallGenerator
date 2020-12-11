import { HorizontalRuler } from "../src/Designer/Plugins/HorizontalRuler";
import { VerticalRuler } from "../src/Designer/Plugins/VerticalRuler";
import { VectorDesigner } from "../src/Designer/VectorDesigner";
import { Vector2 } from '../src/Core/Vector2';
import { AnchorControl } from "../src/Designer/Views/AnchorControl";
import { WallControl } from "../src/Designer/Views/WallControl";
import { Control } from "../src/Designer/Views/Control";
import { GraphicDocument } from "../src/Core/Common";
import { WallPolygonParser } from "../src/WallPolygonParser";
import { HoleControl } from "../src/Designer/Views/HoleControl";
import { ElementResizer } from "../src/Designer/Plugins/ElementResizer";

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
        var hrulercanvas = document.getElementById("HorizontalRuler") as HTMLDivElement;
        var vrulercanvas = document.getElementById("VerticalRuler") as HTMLDivElement;
        var hRuler = new HorizontalRuler(designer, hrulercanvas);
        var vRuler = new VerticalRuler(designer, vrulercanvas);
        designer.run();

        var resize = new ElementResizer(div);
        resize.onResize.add(()=>{
            vRuler.resize();
            hRuler.resize();
            designer.resize();
        });


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
                var arrays = JSON.parse(output.value) as GraphicDocument;
                console.time('Parse');
                // console.profile('Parse')
                designer.from(arrays);
                // console.profileEnd('Parse');
                console.timeEnd('Parse');
            }
        }


        var btnPolygon = document.getElementById("btnPolygon") as HTMLCanvasElement;
        if (btnPolygon) {
            btnPolygon.onclick = () => {
                var output = document.getElementById("output") as HTMLTextAreaElement;
                var group = JSON.parse(output.value) as GraphicDocument;
                console.time('to Polygon');
                var wall = WallPolygonParser.parse(group, true);
                console.timeEnd('to Polygon');
                output.value = JSON.stringify(wall);
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
                designer.moveTo(100, new Vector2());
            }
        }

        var btnAddDoor = document.getElementById("btnAddDoor") as HTMLCanvasElement;
        if (btnAddDoor) {
            btnAddDoor.onclick = () => {


                

                var door = designer.createHole(null, designer.center.x, designer.center.y);
                designer.add(door);
            }
        }








        var btnBackground = document.getElementById("btnBackground") as HTMLCanvasElement;
        if (btnBackground) {
            btnBackground.onclick = () => {
                var input = document.createElement('input');
                input.type = 'file';
                input.onchange = async (event: InputEvent) => {
                    var file = event.target['files'][0];
                    var image = await this.readImage(file);
                    designer.background.setImage(image,12000,5700);
                }
                input.click();
            }
        }










        var btnRandom = document.getElementById("btnRandom") as HTMLCanvasElement;
        if (btnRandom) {
            btnRandom.onclick = () => {
                var anthors: AnchorControl[] = [];
                var segments: WallControl[] = [];
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
                        if (object.walls.length == 0) {
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





        for (let i = 0; i < 5; i++) {
            //   this.unitTest(i.toString());
        }


    }


    public unitTest(key: string) {
        console.time(key);
        let s = 123.123456789;
        let b = 123.987654321;
        let v = new Vector2(123.123456789, 123.987654321);

        for (let i = 0; i < 99999999; i++) {
            v.round(1);
            // s = Math.round(s * 100) / 100;
            // b = Math.round(b * 100) / 100;


        }
        console.log(v);

        console.timeEnd(key)
    }








    /**
 * 从本地读取Json对象
 * @param file 
 */
    public async readImage(file: File): Promise<HTMLImageElement> {
        return new Promise<HTMLImageElement>((resolve, reject) => {
            var reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event: any) => {
                var image = document.createElement('img');

                image.src = event.target.result;

                resolve(image);
            };
            reader.onerror = (ex) => {
                reject(ex);
            }
        });
    }
}


new Examples().main();