import { GroupWalls, WallPolygon } from "./Core/WallElement";
import { Anchor } from './Core/Anchor';
import { Segment } from "./Core/Segment";
import { Vector2 } from './Core/Vector2';

export enum P {
    ABSOLUTE,
    RELATIVE
}







export class WallPolygonParser {



    /**
     * 解析点数据成多边形数据
     * @param area 
     * @param relocation 是否重定位墙的初始坐标位置为墙中心，如果为否 强的 position始终为0
     */
    public static parse(area: GroupWalls, relocation?: boolean): WallPolygon[] {
        var result: WallPolygon[] = [];
        var anchors: { [key: number]: Anchor } = {};
        var walls: { [key: number]: Segment } = {};
        var heights: { [key: number]: number } = {};
        try {
            //parse anchors
            for (let anchor of area.anchors) {
                if (anchor && anchor.id && anchor.x && anchor.y && anchors[anchor.id] == null) {
                    anchors[anchor.id] = new Anchor(anchor.id, anchor.x, anchor.y);
                }
            }
            // parse walls
            for (let wall of area.walls) {
                if (wall && wall.id && wall.anchors && wall.anchors.length === 2) {
                    var object = walls[wall.id];
                    if (object == null) {
                        var from = anchors[wall.anchors[0]];
                        var to = anchors[wall.anchors[1]];
                        if (from && to) {
                            object = new Segment(wall.id, from, to, wall.thick);
                            walls[wall.id] = object;
                            heights[wall.id] = wall.height;
                        }
                    }
                }
            }
            for (let key in anchors) {
                var anchor = anchors[key];
                if (anchor.targets.length > 0) {
                    anchors[key].build();
                }
            }
            for (let key in walls) {
                var wall = walls[key];
                var polygon = new WallPolygon();
                polygon.id = wall.id;
                polygon.height = heights[wall.id];
                polygon.points = wall.points;
                if (relocation) {
                    polygon.position = this.reLocation(polygon.points);
                } else {
                    polygon.position = [0, 0];
                }
                result.push(polygon);
            }
            return result;
        }
        catch (e) {
            return null;
        } finally {
            anchors = {};
            walls = {};
            heights = {};
        }
    }



    private static reLocation(points: number[][]): number[] {
        var center = this.getCenter(points);
        for (let i = 0; i < points.length; i++) {
            var point = points[i];
            point[0] += center[0];
            point[1] += center[1];
        }
        return center;
    }


    private static getCenter(points: number[][]): number[] {
        let left = point[0][0];
        let right = point[0][0];
        let top = point[0][1];
        let bottom = point[0][1];
        for (let i = 1; i < points.length; i++) {
            var point = points[i];
            if (point[0] > right) right = point[0];
            if (point[0] < left) left = point[0];
            if (point[1] > bottom) bottom = point[1];
            if (point[1] < top) top = point[1];
        }
        return [left + (right - left) / 2, top + (bottom - top) / 2];
    }




}