import { Adorner } from "../src/core/Adorner";
import { Segment } from "../src/core/Segment";

/**
 * this is example
 */
export class Examples {
    /**
     * main function
     */
    public async main() {

        console.time('build');
        var adorners: { [key: number]: Adorner } = {};
        adorners[0] = new Adorner(0, 100, 100);
        adorners[1] = new Adorner(1, 200, 100);
        adorners[2] = new Adorner(2, 400, 100);
        adorners[3] = new Adorner(3, 200, 200);
        adorners[4] = new Adorner(4, 100, 300);
        adorners[5] = new Adorner(5, 150, 350);
        adorners[6] = new Adorner(6, 200, 300);
        adorners[7] = new Adorner(7, 270, 350);
        adorners[8] = new Adorner(8, 400, 250);
        adorners[9] = new Adorner(9, 180, 200);
        adorners[10] = new Adorner(10, 220, 200);
        adorners[11] = new Adorner(11, 300, 200);

        var smgents: Segment[] = [];
        smgents.push(new Segment(adorners[0], adorners[1], 20));
        smgents.push(new Segment(adorners[0], adorners[4], 20));
        smgents.push(new Segment(adorners[1], adorners[3], 20));
        smgents.push(new Segment(adorners[2], adorners[1], 40));
        smgents.push(new Segment(adorners[4], adorners[5], 20));
        smgents.push(new Segment(adorners[5], adorners[6], 20));
        smgents.push(new Segment(adorners[6], adorners[7], 20));
        smgents.push(new Segment(adorners[7], adorners[8], 20));
        smgents.push(new Segment(adorners[8], adorners[2], 40));
        smgents.push(new Segment(adorners[3], adorners[9], 20));
        smgents.push(new Segment(adorners[3], adorners[10], 20));
        smgents.push(new Segment(adorners[3], adorners[6], 20));
        smgents.push(new Segment(adorners[1], adorners[11], 20));
        smgents.push(new Segment(adorners[8], adorners[11], 40));
        smgents.push(new Segment(adorners[6], adorners[11], 20));
        for (var key in adorners) {
            adorners[key].build();
        }
        console.timeEnd('build');

        var script = "";
        for (var segment of smgents) {
            script += (`full(${JSON.stringify(segment.points)});\r\n`);
        }
        console.log(script);




    }

}


new Examples().main();