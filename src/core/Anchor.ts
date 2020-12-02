import { Segment } from "./Segment";
import { Vector2 } from "./Vector2";

export class Anchor {
    public id: number;
    private _point: Vector2;
    private _targets: Anchor[];
    private _map: Map<Anchor, Segment>;

    public constructor(id: number, x: number, y: number) {
        this._point = new Vector2(x, y);//.round();
        this._targets = [];
        this._map = new Map();
    }

    public get x(): number {
        return this._point.x;
    }

    public get y(): number {
        return this._point.y;
    }

    private get point(): Vector2 {
        return this._point;
    }

    public get targets(): Anchor[] {
        return this._targets;
    }


    public setPosition(v: Vector2) {
        this._point.x = v.x;
        this._point.y = v.y;
        this._point.round4();
    }

    public dispose() {
        this.remove();
    }


    public remove() {
        if (this._targets.length > 0) {
            // remove all segments and self
            while (this._targets.length > 0) {
                let anchor = this._targets.shift();
                var segment = this._map.get(anchor);
                segment.dispose();
            }
        }
    }




    /**
     * add connection target
     * @param object  target
     * @param segment  segment obejct
     */
    public addTarget(object: Anchor, segment: Segment) {
        if (!this._map.has(object)) {
            this._targets.push(object);
            this._map.set(object, segment);
        }
    }

    public removeTarget(object: Anchor) {
        if (this._map.has(object)) {
            this._map.delete(object);
        }
        var index = this._targets.indexOf(object);
        if (index > -1) {
            this._targets.splice(index, 1);
        }
    }




    /**
     * build segments paths 
     */
    public build() {
        if (this._targets.length > 1) {
            /* sort points by clockwise */
            Vector2.clockwiseSortPoints(this._targets, this);
            /* generate points */
            for (var i = 0; i < this._targets.length; i++) {
                var cur = i;
                var next = (i + 1) % this._targets.length;
                var anchor = this._targets[cur];
                var nextanchor = this._targets[next];
                /* generate edge points */
                var edge_path = this.generateEdgePoints(anchor, true);
                var nextEdge_path = this.generateEdgePoints(nextanchor, false);
                /* get edges intersection point*/
                var intersectionPoint = Vector2.getIntersection(edge_path[0], edge_path[1], nextEdge_path[0], nextEdge_path[1]);
                if (intersectionPoint === null) {
                    /* get projective point */
                    intersectionPoint = Vector2.getProjectivePoint(edge_path[0], edge_path[1], this.point);
                }
                intersectionPoint.round4();
                var segment = this._map.get(anchor);
                var points = segment.getPort(this);
                points[1] = this.point.clone();
                points[0] = intersectionPoint;
                segment = this._map.get(nextanchor);
                points = segment.getPort(this);
                points[2] = intersectionPoint;
                points[1] = this.point.clone();
            }
        }
        else if (this._targets.length === 1) {
            var anchor = this._targets[0];
            var segment = this._map.get(anchor);
            var start = this.point;
            var end = anchor.point;
            var angle = Math.atan2((end.y - start.y), (end.x - start.x));
            var theta = angle * (180 / Math.PI);
            var ps = new Vector2(start.x + segment.thickness / 2, start.y);
            var left_point = ps.rotatePoint(start, theta - 90);
            var right_point = ps.rotatePoint(start, theta + 90);
            var points = segment.getPort(this);
            points[0] = left_point.round4();
            points[1] = this.point.clone();
            points[2] = right_point.round4();
        }

    }

    /**
     * generate the edge on both sides of the path
     * @param target  target 
     * @param right   is right  edge
     */
    private generateEdgePoints(target: Anchor, right: boolean = true): Vector2[] {
        var eulr = right ? 90 : -90;;
        var segment = this._map.get(target);
        var start = this.point;
        var end = target.point;
        var off = segment.thickness / 2;
        var angle = Math.atan2((end.y - start.y), (end.x - start.x));
        var theta = angle * (180 / Math.PI);
        var ps = new Vector2(start.x + off, start.y);
        var pe = new Vector2(end.x + off, end.y);
        var left_point = ps.rotatePoint(start, theta - eulr);
        var right_point = pe.rotatePoint(end, theta - eulr);
        return [left_point, right_point];
    }

}