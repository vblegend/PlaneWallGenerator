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
                const anchor = this._targets.shift();
                const segment = this._map.get(anchor);
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
        const index = this._targets.indexOf(object);
        if (index > -1) {
            this._targets.splice(index, 1);
        }
    }




    /**
     * build segments paths 
     */
    public build() {
        // console.log(this.id);
        if (this._targets.length > 1) {
            /* sort points by clockwise */
            Vector2.clockwiseSortPoints(this._targets, this);
            /* generate points */
            for (let i = 0; i < this._targets.length; i++) {
                const cur = i;
                const next = (i + 1) % this._targets.length;
                const anchor = this._targets[cur];
                const nextanchor = this._targets[next];
                /* generate edge points */
                const edge_path = this.generateEdgePoints(anchor, true);
                const nextEdge_path = this.generateEdgePoints(nextanchor, false);
                /* get edges intersection point*/
                let intersectionPoint = Vector2.getIntersection(edge_path[0], edge_path[1], nextEdge_path[0], nextEdge_path[1]);
                if (intersectionPoint === null) {
                    /* get projective point */
                    intersectionPoint = Vector2.getProjectivePoint(edge_path[0], edge_path[1], this.point);
                }
                intersectionPoint.round4();
                let segment = this._map.get(anchor);
                let points = segment.getPort(this);
                points[1].update(this.point) && segment.needUpdate();
                points[0].update(intersectionPoint) && segment.needUpdate();
                segment = this._map.get(nextanchor);
                points = segment.getPort(this);
                points[2].update(intersectionPoint) && segment.needUpdate();
                points[1].update(this.point) && segment.needUpdate();
            }
        }
        else if (this._targets.length === 1) {
            const anchor = this._targets[0];
            const segment = this._map.get(anchor);
            const start = this.point;
            const end = anchor.point;
            const angle = Math.atan2((end.y - start.y), (end.x - start.x));
            const theta = angle * (180 / Math.PI);
            const ps = new Vector2(start.x + segment.thickness / 2, start.y);
            const left_point = ps.rotatePoint(start, theta - 90).round4();
            const right_point = ps.rotatePoint(start, theta + 90).round4();
            const points = segment.getPort(this);
            points[0].update(left_point) && segment.needUpdate();
            points[1].update(this.point) && segment.needUpdate();
            points[2].update(right_point) && segment.needUpdate();
        }

    }

    /**
     * generate the edge on both sides of the path
     * @param target  target 
     * @param right   is right  edge
     */
    private generateEdgePoints(target: Anchor, right: boolean = true): Vector2[] {
        const eulr = right ? 90 : -90;;
        const segment = this._map.get(target);
        const start = this.point;
        const end = target.point;
        const off = segment.thickness / 2;
        const angle = Math.atan2((end.y - start.y), (end.x - start.x));
        const theta = angle * (180 / Math.PI);
        const ps = new Vector2(start.x + off, start.y);
        const pe = new Vector2(end.x + off, end.y);
        const left_point = ps.rotatePoint(start, theta - eulr);
        const right_point = pe.rotatePoint(end, theta - eulr);
        return [left_point, right_point];
    }

}